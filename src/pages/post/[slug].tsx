import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock  } from 'react-icons/fi'
import { getPrismicClient } from '../../services/prismic';
import Head from "next/head";
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Prismic from '@prismicio/client'
import { RichText } from "prismic-dom";
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {

  const totalWords = post.data.content.reduce((total, contentItem) => {
    total += contentItem.heading.split(' ').length;

    const words = contentItem.body.map(item => item.text.split(' ').length);
    words.map(world => (total+= world));
    return total;
  }, 0);

  const readTime = Math.ceil(totalWords / 200);

  const router = useRouter();

  if (router.isFallback) {
    return <strong>Carregando...</strong>
  }
  
  return (
    <>
      <Head>
        <title> {post.data.title} | spacetravelling</title>
      </Head>
      <img src={post.data.banner.url} alt="banner" className={styles.banner} />
      <main className={styles.container}>
        <div className={styles.post}>
          <h1> {post.data.title}</h1>
          <section className={styles.info}>
            <FiCalendar/>
            <time>{post.first_publication_date}</time>
            <FiUser/>
            <span>{post.data.author}</span>
            <FiClock/>
            <span>{readTime} min</span>
          </section>   
          {post.data.content.map(content => {
            return (
              <article key={content.heading}>
                <h2>{content.heading}</h2>
                <div
                  className={styles.postContent}
                  dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body), }}
                />
              </article>
            );
          })}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      }
    }
  })
  return {
    paths,
    fallback: true,
  };

};

export const getStaticProps = async context => {
  const prismic = getPrismicClient();
  const { slug } = context.params;
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: new Date(response.first_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }),
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  return {
    props: {
      post,
    }
  }
};

import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Head from 'next/head';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Link from 'next/link';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client'
import {FiCalendar, FiUser} from 'react-icons/fi'
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {

  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);

  async function handleNextPage() {
    if (nextPage == null && currentPage !== 1) {
      return;
    }
    const postsResults = await fetch(`${nextPage}`).then(response =>
      response.json()
    );
    setNextPage(postsResults.next_page);
    setCurrentPage(postsResults.page);

    const loadPosts = postsResults.results.map(post => {
      return {
          uid: post.uid,
          first_publication_date: new Date(post.first_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          }),
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
      },
      };
    });
    setPosts([...posts, ...loadPosts]);
}


  return (
    <>
      <Head>
        <title>Posts | spacetravelling</title>
      </Head>

    <main className={styles.container}>
        <div className={styles.posts}>
            { posts.map( post=> (                
                <Link href={`/post/${post.uid}`} key={post.uid}> 
                <a >                       
                        <strong> {post.data.title} </strong> 
                        <p>{post.data.subtitle}</p> 
                        <section className={styles.info}>
                          <FiCalendar className={styles.icon}/>
                          <time>{post.first_publication_date}</time> 
                          <FiUser className={styles.icon}/>
                          <span>{post.data.author}</span>
                        </section>
                </a> 
                </Link>             
            ) )}  
            {nextPage && (
            <button 
              type="button" 
              onClick={handleNextPage} 
              className={styles.buttonLoadingPosts}
            >
              Carregar mais posts
            </button>
          )}             
        </div>
    </main> 
    </>
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await  prismic.query([
  Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.author', 'posts.subtitle'],
      pageSize: 2,
  });
  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,      
        author: post.data.author,  
      },         
       first_publication_date: new Date(post.first_publication_date).toLocaleDateString('pt-BR', {
         day: '2-digit',
         month: 'long',
         year: 'numeric'
       })
    }
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  }

  return {
    props: { postsPagination }
  }
};

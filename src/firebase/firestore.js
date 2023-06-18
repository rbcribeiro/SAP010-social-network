import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { getAppAuth } from './auth';
import { app } from './app';

// variable firestone
const db = getFirestore(app);



export const createPost = (description) => {
  const auth = getAppAuth();
  const userPost = auth.currentUser;
  const userName = userPost.displayName;
  return addDoc(collection(db, 'posts'), {
    name: userName,
    author: auth.currentUser.uid,
    description,
    createdAt: new Date(),
    likes: [],
    whoLiked: [],
  });
};

export async function accessPost() {
  const allPosts = [];
  const postQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(postQuery);
  querySnapshot.forEach((post) => {
    const data = post.data();
    data.id = post.id;
    allPosts.push(data);
  });
  return allPosts;
}

// export const createPost = (description) => {
//   const auth = getAppAuth();
//   const userPost = auth.currentUser;
//   const postComment = document.getElementById('ExplorAi').value;
//   const userName = userPost.displayName;
//   const userEmail = userPost.email;

//   addDoc(collection(db, 'posts'), {
//     name: userName,
//     author: auth.currentUser.uid,
//     email: userEmail,
//     postContent: postComment,
//     date: new Date(),
//     like: [],
//   });
// };
// export async function getPost() {
//   const allPosts = [];
//   const postQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
//   const querySnapshot = await getDocs(postQuery);
//   querySnapshot.forEach((post) => {
//     const data = post.data();
//     data.id = post.id;
//     allPosts.push(data);
//   });
//   return allPosts;
// }

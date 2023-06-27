import {
  addDoc,
  getDoc,
  doc,
  db,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';

import {
  createPost,
  hasUserLikedPost,
  deletePost,
  updatePost,
} from '../src/firebase/firestore';
import { getAppAuth } from '../src/firebase/auth';

jest.mock('firebase/firestore');
jest.mock('../src/firebase/auth');

const mockAppAuth = {
  currentUser: {
    displayName: 'Maria',
    uid: 'uid9876',
  },
};
getAppAuth.mockReturnValue(mockAppAuth);

describe('createPost', () => {
  it('should create a new post', async () => {
    addDoc.mockResolvedValue();
    const description = 'Ótima viagem.';
    const post = {
      name: mockAppAuth.currentUser.displayName,
      author: mockAppAuth.currentUser.uid,
      description,
      createdAt: new Date(),
      likes: [],
      whoLiked: [],
    };
    await createPost(description);
    expect(addDoc).toHaveBeenCalledTimes(1);
    expect(addDoc).toHaveBeenCalledWith(undefined, post);
  });
});

describe('deletePost', () => {
  it('should delete a post', async () => {
    deletePost();
    expect(deleteDoc).toHaveBeenCalledTimes(1);
  });
});

describe('updatePost', () => {
  it('should edit a post', async () => {
    updatePost();
    expect(updateDoc).toHaveBeenCalledTimes(1);
  });
});

describe('hasUserLikedPost', () => {
  it('deve retornar true se o usuário tiver curtido o post', async () => {
    const mockPostData = {
      whoLiked: ['uid9876'],
    };
    const mockGetDoc = {
      exists: true,
      data: jest.fn(() => mockPostData),
    };
    getDoc.mockReturnValueOnce(mockGetDoc);

    const postId = 'postId';
    const resultado = await hasUserLikedPost(postId);

    expect(getDoc).toHaveBeenCalledWith(
      doc(db, 'posts', postId),
    );
    expect(resultado).toBe(true);
  });

  it('deve retornar false se o usuário não tiver curtido o post', async () => {
    const mockPostData = {
      whoLiked: ['userId'],
    };
    const mockGetDoc = jest.fn(() => ({
      exists: true,
      data: jest.fn(() => mockPostData),
    }));
    getDoc.mockReturnValueOnce(mockGetDoc);

    const postId = 'postId';
    const resultado = await hasUserLikedPost(postId);

    expect(getDoc).toHaveBeenCalledWith(
      doc(undefined, 'posts', postId),
    );
    expect(resultado).toBe(false);
  });

  it('deve retornar false se o post não existir', async () => {
    const mockGetDoc = jest.fn(() => ({
      exists: false,
    }));
    getDoc.mockReturnValueOnce(mockGetDoc);

    const postId = 'postId';
    const resultado = await hasUserLikedPost(postId);

    expect(getDoc).toHaveBeenCalledWith(
      doc(undefined, 'posts', postId),
    );
    expect(resultado).toBe(false);
  });
});
import { getUserName, getUserId, logOut } from '../../firebase/auth.js';
import {
  createPost,
  accessPost,
  updatePost,
  likePost,
  deletePost,
} from '../../firebase/firestore.js';
import { uploadProfilePhoto } from '../../firebase/storage.js';

export default () => {
  const timeline = document.createElement('div');
  const viewPost = `
  <div class="container">
    <div class='left-timeline'>
      <img src='./assets/icon-photo.png' alt='Foto de perfil' class='profilePhoto'>
      <p class="postTitle">Olá ${getUserName()}, bem-vindo(a) de volta!</p>
      <figure class='icones'>
        <button type="button" class='button-timeline' id='home-btn'><img src="./assets/icon-home.png" class="icon-timeline" alt="Icone home">
        <button type="button" class='button-timeline' id='logout-btn'><img src='./assets/icon-sair.png' class="icon-timeline" alt='logout icon'>
      </figure>
      <input type="file" id="profilePhotoInput" accept="image/*" style="display: none;">
    </div>
    <img src="./assets/imagetimeline.png" class="img-timeline" alt="edit image" >
    <div class="right-timeline">
      <div class="input-container">
        <textarea class="input-message" id="postArea" placeholder="COMPARTILHE UMA EXPERIÊNCIA..."></textarea>
        <button class="shareBtn" id="sharePost">COMPARTILHAR</button>
      </div>
    <div id="postList"></div>
  </div>
    </div>
  `;

  timeline.innerHTML = viewPost;

  const postBtn = timeline.querySelector('#sharePost');
  const descriptionPost = timeline.querySelector('#postArea');
  const postList = timeline.querySelector('#postList');
  const profilePhotoInput = timeline.querySelector('#profilePhotoInput');
  const profilePhoto = timeline.querySelector('.profilePhoto');
  const logOutBtn = timeline.querySelector('#logout-btn');

  const createPostElement = (
    name,
    createdAt,
    description,
    postId,
    authorId,
    whoLiked,
    profilePhotoUrl,
  ) => {
    const createdAtDate = new Date(createdAt.seconds * 1000);
    const createdAtFormattedDate = createdAtDate.toLocaleDateString('pt-BR');
    const createdAtFormattedTime = createdAtDate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const createdAtFormatted = `${createdAtFormattedDate} ~ ${createdAtFormattedTime}`;
    const postElement = document.createElement('div');
    postElement.innerHTML = `
      <div class="post-container">
        <div class='nameUser'>
          <p class='userName'>${name}</p>
          <p class='dataPost'>${createdAtFormatted}</p>
        </div>
        <p class='textPost'>${description}</p>
        <div class='image-icons'>
        <span class='likePost' id='likes-counter-${postId}'>${whoLiked.length}</span>
        <button type="button" class='icons' id='like-Post' data-post-id='${postId}'>
        <a class='icons' id='likePost'><img src='./assets/likeicon.png' alt='like image' class='icons'></a>
      </button>
      ${authorId === getUserId() ? `<button type="button" data-post-id='${postId}' class='icons' id='editPost'>
      <a class='icons'><img src='./assets/editicon.png' alt='edit image' class='icons'></a>
    </button>
    <button type="button" class='icons' id='btn-delete' data-post-id='${postId}'>
    <img src='./assets/deleteicon.png' alt='delete image' class='icons'>
    </button>` : ''}
    </div>
  </div>
`;

    if (profilePhotoUrl) {
      const profilePhotoElement = postElement.querySelector('.profilePhoto');
      profilePhotoElement.src = profilePhotoUrl;
    }

    return postElement;
  };

  const loadPosts = async () => {
    postList.innerHTML = '';
    const postsFirestore = await accessPost();

    postsFirestore.forEach(async (post) => {
      const {
        name, createdAt, description, id, author, whoLiked, profilePhotoUrl,
      } = post;
      const postElement = createPostElement(
        name,
        createdAt,
        description,
        id,
        author,
        whoLiked,
        profilePhotoUrl,
      );
      postList.appendChild(postElement);

      const likeButton = postElement.querySelector('#like-Post');
      const postId = likeButton.getAttribute('data-post-id');
      const likesCounter = postElement.querySelector(`#likes-counter-${postId}`);
      likeButton.addEventListener('click', async () => {
        try {
          const likeLike = await likePost(postId, getUserId());
          let currentLikes = parseInt(likesCounter.innerText, 10);
          if (likeLike === 'adicione like') {
            currentLikes += 1;
          } else {
            currentLikes -= 1;
          }
          likesCounter.innerText = currentLikes;
        } catch (error) {
          console.error('Error al dar like:', error);
        }
      });
    });
  };

  const handleProfilePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadProfilePhoto(file)
        .then((url) => {
          profilePhoto.src = url;
          localStorage.setItem('profilePhotoUrl', url);
        })
        .catch((error) => {
          console.log('Erro ao fazer upload da foto de perfil:', error);
        });
    }
  };

  const handlePostBtnClick = () => {
    const description = descriptionPost.value;

    if (!description) {
      alert('Preencha o campo');
    } else {
      createPost(description)
        .then(() => {
          descriptionPost.value = '';
          // createPostElement.insertBefore - ajustar
          loadPosts(); // substituir
          alert('Publicação efetuada com sucesso!');
        })
        .catch(() => {
          alert('Ocorreu um erro ao criar o post. Por favor, tente novamente mais tarde');
        });
    }
  };

  const handlePostListClick = (event) => {
    const target = event.target;
    const deleteButton = target.closest('#btn-delete');
    const editButton = target.closest('#editPost');
    if (deleteButton) {
      const postId = deleteButton.getAttribute('data-post-id');
      if (window.confirm('Tem certeza de que deseja excluir a publicação?')) {
        deletePost(postId)
          .then(() => {
            target.closest('.post-container').remove(); // remove da tela os posts que são excluídos
            alert('Publicação excluída com sucesso!');
          })
          .catch((error) => {
            alert('Ocorreu um erro ao excluir o post. Por favor, tente novamente mais tarde', error);
          });
      }
    } else if (editButton) {
      const postId = editButton.getAttribute('data-post-id');
      const postElement = editButton.closest('.post-container');
      const textPostElement = postElement.querySelector('.textPost');
      const newText = prompt('Edite a sua postagem:', textPostElement.textContent);
      if (newText && newText.trim() !== '') {
        updatePost(postId, { description: newText })
          .then(() => {
            textPostElement.textContent = newText;
            alert('Post atualizado com sucesso!');
          })
          .catch(() => {
            alert('Ocorreu um erro ao editar o post. Por favor, tente novamente mais tarde');
          });
      }
    }
  };

  profilePhoto.addEventListener('click', () => {
    profilePhotoInput.click();
  });

  profilePhotoInput.addEventListener('change', handleProfilePhotoUpload);
  postBtn.addEventListener('click', handlePostBtnClick);
  postList.addEventListener('click', handlePostListClick);

  const storedProfilePhotoUrl = localStorage.getItem('profilePhotoUrl');
  if (storedProfilePhotoUrl) {
    profilePhoto.src = storedProfilePhotoUrl;
  }

  logOutBtn.addEventListener('click', () => {
    logOut()
      .then(() => {
        window.location.hash = '#login';
      })
      .catch(() => {
        alert('Ocorreu um erro, tente novamente.');
      });
  });

  loadPosts();
  return timeline;
};

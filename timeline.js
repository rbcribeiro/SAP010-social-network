import { getUserName, getUserId } from '../../firebase/auth.js';
import { createPost, accessPost, updatePost } from '../../firebase/firestore.js';
import delPost from './posts.js';

export default () => {
  const timeline = document.createElement('div');
  const viewPost = `
  <div class="container">
    <div class='left-timeline'>
      <p class="postTitle">Olá ${getUserName()}, bem-vindo(a) de volta!</p>
      <figure class='icones'>
        <a href="" class="icon-timeline"><img src="./img/assets/icon-home.png" class="icon-timeline" alt="Icone home"> Home </a>
        <a href="" class="icon-timeline"><img src="./img/assets/icon-sair.png" class="icon-timeline" alt="Icone sair "> Sair </a>
      </figure>

      <img src="./img/assets/imagetimeline.png" class="img-timeline" alt="edit image" width="300px">
    </div>
    <div class="right-timeline">
      <div class="input-container">
        <textarea class="input-message" id="postArea" placeholder="COMPARTILHE UMA EXPERIÊNCIA..."></textarea>
        <button class="shareBtn" id="sharePost">COMPARTILHAR</button>
      </div>
      <div id="postList"></div>
    </div>
  </div>
</div>
  `;

  timeline.innerHTML = viewPost;

  const postBtn = timeline.querySelector('#sharePost');
  const descriptionPost = timeline.querySelector('#postArea');
  const postList = timeline.querySelector('#postList');

  const createPostElement = (name, createdAt, description, postId, authorId) => {
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
          <button type="button" class='icons' id='likePost'>
            <a class='icons' id='likePost'><img src='./img/assets/likeicon.png' alt='like image' width='30px'></a>
          </button>
          ${authorId === getUserId() ? `<button type="button" data-post-id='${postId}' class='icons' id='editPost'>
          <a class='icons' id='editPost'><img src='./img/assets/editicon.png' alt='edit image' width='30px'></a>
        </button>
        <button type="button" class='icons' id='btn-delete' data-post-id='${postId}'>
        <img src='./img/assets/deleteicon.png' alt='delete image' width='30px'>
        </button>` : ''}
        </div>
      </div>
    `;
    return postElement;
  };

  const loadPosts = async () => {
    postList.innerHTML = '';
    const postsFirestore = await accessPost();
    postsFirestore.forEach((post) => {
      const {
        name, createdAt, description, id, author,
      } = post;
      const postElement = createPostElement(name, createdAt, description, id, author);
      postList.appendChild(postElement);
    });
  };

  const handlePostBtnClick = () => {
    const description = descriptionPost.value;

    if (!description) {
      alert('Preencha o campo');
    } else {
      createPost(description)
        .then(() => {
          descriptionPost.value = '';
          loadPosts();
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
      delPost(postId);
      loadPosts();

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
            alert('Ocorreu um erro ao excluir o post. Por favor, tente novamente mais tarde');
          });
      }
    }
  };

  postBtn.addEventListener('click', handlePostBtnClick);
  postList.addEventListener('click', handlePostListClick);

  loadPosts();

  return timeline;
};
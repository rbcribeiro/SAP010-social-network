import { loginWithEmail, loginGoogle } from '../../firebase/auth.js';

export default () => {
  const container = document.createElement('div');

  const templateLogin = /*html*/ `
  <section class="login-wrap">

    <div class = "left">
    <figure class="logo-container">
  <img src="img/logo.png" id="logo" alt="Logo da ExploraAí">
  </figure>
  <h1>ExplorAí</h1>
  <br>
  <h6 class= "left-text">COMPARTHILE EXPERIÊNCIAS E AVENTURAS.
    <br>
    RECEBA DICAS E INDICAÇÕES.
  </h6>
    </div>

  <div class= "right"
  <h2>Entrar</h2>
  <form class="login-form">
  <div class="inputs-container">
  <input type="text" class="inputs-info" placeholder="E-MAIL" id ="email" />
  <input type="password" class="inputs-info" placeholder="SENHA" id ="senha" />
  </div>

  <nav>
  <button type="button" id="login-button" href="#">ENTRAR</button>
  </nav>

  <div class="txt1">
  Esqueceu a senha? <br>
  Não possui uma conta? 
  <button type="button" class="register-button"><a class= "reg-btn" href="#register">Cadastre-se</a></button>
  </div>

  <div class="txt2">
  Ou <br>
  Entrar com:
  </div>

 <figure>
 <button class="google-btn">
  <img src="img/assets/google.png" id="google-img" alt="Logo do Google" width = 100px>
 </button> 
 </figure>
  </form>
</div>
  </section>`

  container.innerHTML = templateLogin;

  const emailInput = container.querySelector('#email');
  const senhaInput = container.querySelector('#senha');
  const loginButton = container.querySelector('#login-button');

  const handleLogin = () => {
    const email = emailInput.value;
    const senha = senhaInput.value;

    loginWithEmail(email, senha)
      .then(() => {
        window.location.hash = '#timeline';
      })
      .catch((error) => {
        alert('Usuário ou senha incorretos');
        console.log('Erro de autenticação:', error);
      });
  };

  loginButton.addEventListener('click', handleLogin);

  return container;

}

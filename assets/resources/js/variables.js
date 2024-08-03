const loading = document.querySelector("#loading");
const inputLoading = document.querySelector("#input-loading");

const main = document.querySelector("main");

const navigation = document.querySelector("nav");

const popUp = document.querySelector("#pop-up");
const popUpsCloses = document.querySelectorAll("#pop-up .close");

const [userButton, loginButton, registerButton, menuButton] = document.querySelectorAll("#navigation > div");
const [login, register, menu, language, forgotPassword] = popUp.querySelectorAll("#pop-up > section");

const [homeButton, menusButton, orderButton, moreButton] = document.querySelectorAll("#navigation-bottom > div");
const [home, menus, order, more, user] = main.querySelectorAll("main > section");

const slide = document.querySelector("#slide > div");
const [slideLeft, slideRight] = document.querySelectorAll("#slide button");

const [menuLoginButton, menuHomeButton, menuMenusButton, menuOrderButton, menuMoreButton, menuLanguageButton] =
  document.querySelectorAll("#menu button");

const [languageTr, languageEn] = document.querySelectorAll("#language button");

const notification = document.querySelector("#notification");
const redirectedNotification = document.querySelector("#redirected-notification");

const registerFromLogin = document.querySelector("#register-from-login");
const forgotPasswordFromLogin = document.querySelector("#forgot-password-from-login");
const loginFromRegister = document.querySelector("#login-from-register");

const registerSection = {
  phase: document.querySelector("#register-phase"),
  email: document.querySelector("#register-phase > :first-of-type input"),
  first: document.querySelector("#register-first"),
  code: document.querySelector("#register-phase > :nth-of-type(2) input"),
  second: document.querySelector("#register-second"),
  secondCode: document.querySelector("#register-phase > :last-of-type > input[type='hidden']"),
  name: document.querySelector("#register-phase > :last-of-type > :nth-of-type(1) > input"),
  phone: document.querySelector("#register-phase > :last-of-type > :nth-of-type(2) > input"),
  address: document.querySelector("#register-phase > :last-of-type > :nth-of-type(3) > textarea"),
  password: document.querySelector("#register-phase > :last-of-type > :nth-of-type(4) > input"),
  passwordCheck: document.querySelector("#register-phase > :last-of-type > :nth-of-type(5) > input"),
  third: document.querySelector("#register-third"),
};

const loginUserButton = document.querySelector("#login button");

const loginSection = {
  email: document.querySelector("#login input[type='email']"),
  password: document.querySelector("#login input[type='password']"),
};

var slideTime = 0;

var slideWidth = window.innerWidth / window.innerHeight > 0.75 ? 30 : 100;

const uploadImageInput = document.querySelector("#upload-image");
const uploadImageCanvas = document.querySelector("#upload-image-canvas");

const userPicture = document.querySelector("#user #user-picture");
const userPictureDefault = document.querySelector("#user #user-picture-default");
const userName = document.querySelector("#user #user-name");
const userEmail = document.querySelector("#user #user-email");
const userPhone = document.querySelector("#user #user-phone");
const userAddress = document.querySelector("#user #user-address");
const userOrders = document.querySelector("#user #user-orders");

const edit = document.querySelector("#user #user-edit");
const logout = document.querySelector("#user #user-logout");

var selectedMenu = {};
const orderSection = {
  menu: document.querySelector("#order #order-menu"),
  price: document.querySelector("#order #order-price"),
  province: document.querySelector("#order #order-province"),
  district: document.querySelector("#order #order-district"),
  promotion: document.querySelector("#order #order-promotion"),
  promotionStatus: document.querySelector("#order #order-promotion-status"),
  amount: document.querySelector("#order #order-amount"),
  days: document.querySelector("#order #order-days"),
  time: document.querySelector("#order #order-time"),
  name: document.querySelector("#order #order-name"),
  phone: document.querySelector("#order #order-phone"),
  email: document.querySelector("#order #order-email"),
  address: document.querySelector("#order #order-address"),
  gender: document.querySelector("#order #order-gender"),
  height: document.querySelector("#order #order-height"),
  weight: document.querySelector("#order #order-weight"),
  allergy: document.querySelector("#order #order-allergy"),
  disease: document.querySelector("#order #order-disease"),
  occupation: document.querySelector("#order #order-occupation"),
  extra: document.querySelector("#order #order-extra"),
  complete: document.querySelector("#order #order-complete"),

  individual: document.querySelector("#order #order-individual"),
  company: document.querySelector("#order #order-company"),
  taxNumber: document.querySelector("#order #order-tax-number"),
  companyName: document.querySelector("#order #order-company-name"),
  taxAdministration: document.querySelector("#order #order-tax-administration"),
  taxMethod: document.querySelector("#order #order-tax-method"),
  companyAddress: document.querySelector("#order #order-company-address"),
};
const [registerSalesContract, salesContract, KVKK] = document.querySelectorAll("button.checkbox");

const companies = document.querySelectorAll("#order .company");
const individuals = document.querySelectorAll("#order .individual");

var information;

var balance = 0;
const userBalance = document.querySelector("#user #user-balance");
const orderBalance = document.querySelector("#order #order-balance");

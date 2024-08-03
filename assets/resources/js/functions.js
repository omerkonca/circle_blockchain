/* =========={ General }========================================================================================== */

function assign(element, action, self = false, press = false) {
  element.addEventListener("click", (event) => {
    if (self && event.target != self) return;
    event.preventDefault();
    action(event);
  });

  if (!press)
    element.addEventListener("touchstart", (event) => {
      if (self && event.target != self) return;
      event.preventDefault();
      action(event);
    });
}

/* =========={ UI }========================================================================================== */

function load(button, section) {
  loading.classList.add("loading");

  document.querySelector("main > section.active").classList.remove("active");

  let currentSelectedButton = document.querySelector("#navigation-bottom > div.selected");
  if (currentSelectedButton) currentSelectedButton.classList.remove("selected");

  button.classList.add("selected");

  section.classList.add("active");

  setTimeout(() => {
    loading.classList.remove("loading");
  }, 200);
}

function openPopUp(section) {
  section.classList.add("displayed");
  popUp.classList.add("active");
}

function closePopUp() {
  let section = document.querySelector(":not(#notification).displayed");

  if (section) section.classList.remove("displayed");

  popUp.classList.remove("active");
}

function openAnotherPopUp(section) {
  closePopUp();
  setTimeout(() => openPopUp(section), 200);
}

function closePopUpThenLoad(button, section) {
  closePopUp();
  load(button, section);
}

function slideGoLeft(event) {
  event.preventDefault();

  slideTime = 0;

  slideLeft.classList.add("active");
  setTimeout(() => slideLeft.classList.remove("active"), 200);

  let current = Math.abs(parseInt(slide.style.transform.split("(")[1]) / slideWidth);

  slide.style.transform = `translateX(-${
    (current ? current - 1 : parseInt(slide.dataset.slides - 1)) * slideWidth
  }rem)`;
}

function slideGoRight(event) {
  if (event) event.preventDefault();

  slideTime = 0;

  slideRight.classList.add("active");
  setTimeout(() => slideRight.classList.remove("active"), 200);

  let current = Math.abs(parseInt(slide.style.transform.split("(")[1]) / slideWidth);

  slide.style.transform = `translateX(-${
    (current == parseInt(slide.dataset.slides - 1) ? 0 : current + 1) * slideWidth
  }rem)`;
}

function notify(message = "Bir hata oluştu, lütfen tekrar deneyiniz.", duration = 5000) {
  notification.innerHTML = message;
  notification.classList.add("displayed");
  setTimeout(() => {
    notification.classList.remove("displayed");
    setTimeout(() => (notification.innerHTML = ""), 500);
  }, duration);
}

/* =========={ Utility }========================================================================================== */

function translate(index) {
  closePopUp();

  switch (index) {
    case 0:
      console.log("Türkçe");
      break;
    case 1:
      console.log("English");
      break;
  }
}

function uploadImage() {
  if (!uploadImageInput.files[0]) {
    notify();
    return;
  }

  let fileReader = new FileReader();

  fileReader.onload = (event) => {
    let image = new Image();

    image.onload = () => {
      let context = uploadImageCanvas.getContext("2d");

      uploadImageCanvas.width = 256;
      uploadImageCanvas.height = 256;

      let ratio = Math.min(256 / image.width, 256 / image.height);

      let width = image.width * ratio;
      let height = image.height * ratio;

      ratio = 1;

      if (width < 256) ratio = 256 / width;
      if (Math.abs(ratio - 1) < 1e-14 && height < 256) ratio = 256 / height;

      width = Math.min(image.width, image.width / ((width * ratio) / 256));
      height = Math.min(image.height, image.height / ((height * ratio) / 256));

      context.drawImage(
        image,
        Math.max(0, (image.width - width) * 0.5),
        Math.max(0, (image.height - height) * 0.5),
        width,
        height,
        0,
        0,
        256,
        256
      );

      const base64 = uploadImageCanvas.toDataURL("image/png");

      console.log(base64); // GOT BASE64
    };

    image.src = event.target.result;
  };

  fileReader.readAsDataURL(uploadImageInput.files[0]);
}

/* =========={ Connection }========================================================================================== */

async function get(endpoint) {
  try {
    return await fetch("services/" + endpoint).then((response) => response.json());
  } catch {
    return {
      status: "error",
    };
  }
}

async function post(endpoint, body) {
  try {
    return await fetch("services/" + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((response) => response.json());
  } catch {
    return {
      status: "error",
    };
  }
}

/* =========={ Register }======================================== */

async function registerFirstPhase(event) {
  if (!registerSection.email.value) {
    notify("Lütfen e-posta adresinizi giriniz.");
    return;
  }

  if (!registerSection.email.value.includes("@") || !registerSection.email.value.includes(".")) {
    notify("E-posta adresiniz geçerli değildir, lütfen tekrar deneyiniz.");
  }

  if (!registerSalesContract.classList.contains("checked")) {
    notify("Lütfen KVKK metnini kabul ediniz.");
    return;
  }

  inputLoading.classList.add("loading");

  let response = await post("register.php", { phase: "register", email: registerSection.email.value });

  inputLoading.classList.remove("loading");

  switch (response.status) {
    case "error":
      notify();
      break;
    case "email_invalid":
      notify("Lütfen geçerli bir e-posta adresi giriniz.");
      break;
    case "email_used":
      notify("Bu e-posta adresi kullanımda, lütfen yeni bir e-posta adresi giriniz.");
      break;
    case "success":
      localStorage.register = registerSection.email.value;
      registerSection.phase.classList.remove("first");
      registerSection.phase.classList.add("second");
      break;
  }
}

async function registerSecondPhase(event) {
  if (!registerSection.code.value) {
    notify("Lütfen doğrulama kodunu giriniz.");
    return;
  }

  inputLoading.classList.add("loading");

  let response = await post("register.php", { phase: "confirm", code: registerSection.code.value });

  inputLoading.classList.remove("loading");

  registerSection.secondCode.value = response.code;

  switch (response.status) {
    case "error":
      notify();
      break;
    case "timeout":
      notify("Doğrulama kodu zaman aşımına uğradı.");
      registerSection.phase.classList.remove("second");
      registerSection.phase.classList.add("first");
      registerReturn();
      break;
    case "maximum_attempt":
      notify("Deneme hakkınızı doldurdunuz.");
      registerSection.phase.classList.remove("second");
      registerSection.phase.classList.add("first");
      registerReturn();
      break;
    case "code_invalid":
      notify("Hatalı kod girdiniz, lütfen tekrar deneyiniz.");
      break;
    case "success":
      registerSection.phase.classList.remove("second");
      registerSection.phase.classList.add("third");
      break;
  }
}

async function registerThirdPhase(event) {
  if (
    !registerSection.name.value ||
    !registerSection.phone.value ||
    !registerSection.address.value ||
    !registerSection.password.value
  ) {
    notify("Lütfen alanları eksiksiz giriniz.");
    return;
  }

  if (registerSection.password.value != registerSection.passwordCheck.value) {
    notify("Şifreler eşleşmiyor, lütfen tekrar deneyiniz.");
    return;
  }

  inputLoading.classList.add("loading");

  let response = await post("register.php", {
    phase: "create",
    code: registerSection.secondCode.value,
    name: registerSection.name.value,
    address: registerSection.address.value,
    phone: registerSection.phone.value,
    password: registerSection.password.value,
  });

  inputLoading.classList.remove("loading");

  switch (response.status) {
    case "error":
      notify();
      break;
    case "timeout":
      notify("Üyelik kaydı zaman aşımına uğradı.");
      registerSection.phase.classList.remove("third");
      registerSection.phase.classList.add("first");
      registerReturn();
      break;
    case "maximum_attempt":
      notify("Deneme hakkınızı doldurdunuz.");
      registerSection.phase.classList.remove("third");
      registerSection.phase.classList.add("first");
      registerReturn();
      break;
    case "code_invalid":
      notify("Hatalı kod girdiniz, lütfen tekrar deneyiniz.");
      break;
    case "success":
      notify("Üyelik kaydı başarıyla oluşturuldu.");
      closePopUp();
      let email = localStorage.register;
      localStorage.clear();
      loginDirect(email, registerSection.password.value);
      registerReturn();
      W3SSDK.complete(
        response.data.appId,
        response.data.userToken,
        response.data.encryptionKey,
        response.data.challengeId
      );
      break;
  }
}

function registerReturn() {
  registerSection.phase.className = "first";
  registerSection.code.value = "";
  registerSection.name.value = "";
  registerSection.phone.value = "";
  registerSection.address.value = "";
  registerSection.password.value = "";
  registerSection.passwordCheck.value = "";
}

/* =========={ Login }======================================== */

function loginUser() {
  if (!loginSection.email.value) {
    notify("Lütfen e-posta adresinizi giriniz.");
    return;
  } else if (!loginSection.password.value) {
    notify("Lütfen şifrenizi giriniz.");
    return;
  }

  loginDirect(loginSection.email.value, loginSection.password.value);
}

async function loginDirect(email, password, remembered = false) {
  inputLoading.classList.add("loading");

  let response = await post("login.php", {
    email,
    password,
  });

  inputLoading.classList.remove("loading");

  balance = response.balance ? response.balance : 0;

  userBalance.innerHTML = `Bakiye: ${balance}$`;
  orderBalance.innerHTML = `Bakiye: ${balance}$`;

  switch (response.status) {
    case "error":
      notify();
      break;
    case "user_invalid":
      notify("E-posta veya şifre hatalı, lütfen tekrar deneyiniz.");
      break;
    case "success":
      userButton.style.display = "flex";
      loginButton.style.display = "none";
      registerButton.style.display = "none";
      menuLoginButton.style.display = "none";
      document.querySelector("#menu hr").style.display = "none";

      information = response.information;

      userName.innerHTML = information.name;
      userEmail.innerHTML = information.email;
      userPhone.innerHTML = information.phone;
      userAddress.innerHTML = information.address;

      information.orders.individual.forEach((order) => {
        userOrders.innerHTML += `<li>
          <span>Tarih: ${order.date}</span>
          <span>Menü: ${order.menu_id}</span>
          <span>Gün Sayısı: ${order.days}</span>
          <span>Teslimat Saati: ${order.time}</span>
          <span>Adres: ${order.province_id} ${order.district_id} ${order.address}</span>
        </li>`;
      });

      information.orders.company.forEach((order) => {
        userOrders.innerHTML += `<li>
          <span>Şirket: ${order.company_name}</span>
          <span>Tarih: ${order.date}</span>
          <span>Gün Sayısı: ${order.days}</span>
          <span>Teslimat Saati: ${order.time}</span>
          <span>Teslimat Adresi: ${order.province_id} ${order.district_id} ${order.address}</span>
          <span>Menü: ${order.menu_id}</span>
          <span>Alerji Durumu: ${order.allergy}</span>
          <span>Hastalık Durumu: ${order.disease}</span>
          <span>Ek Açıklama: ${order.extra}</span>
        </li>`;
      });

      if (information.picture == "-") {
        userPicture.style.display = "none";
      } else {
        userPictureDefault.style.display = "none";
        userPicture.src = information.picture;
      }

      if (!remembered) {
        localStorage.email = email;
        localStorage.password = password;
        localStorage.time = new Date().getTime();

        notify("Başarıyla giriş yapıldı.");
        load(userButton, user);
        closePopUp();
      }
      break;
  }
}

function loginRememberedUser() {
  if (!localStorage.time) return;

  if ((new Date().getTime() - parseInt(localStorage.time)) / (1000 * 60 * 60 * 24) > 30) {
    localStorage.clear();
    return;
  }

  loginDirect(localStorage.email, localStorage.password, true);
}

function logoutUser() {
  localStorage.clear();
  location.reload();
}

/* =========={ Public }======================================== */

async function getMenus() {
  menus.innerHTML = `<h2>Menüler</h2>`;

  let data = await get("menus.php");

  if (data.status == "error") {
    let error = document.createElement("p");

    error.className = "fetch-error";

    error.innerHTML = "Menüler getirilirken bir problem oluştu. Lütfen sayfayı yenileyiniz";

    menus.appendChild(error);

    return;
  }

  data.forEach((menu) => {
    let content = document.createElement("div");

    content.className = "menu";

    content.innerHTML = `<i class="fa-solid fa-caret-left expand"></i><div class="menu-heading"><img src="./assets/images/menus/${menu.picture}" alt="Menü" /><div><h4>${menu.name}</h4><p>${menu.description}</p><button data-id="${menu.id}" data-name="${menu.name}" data-picture="${menu.picture}"><i class="fa-solid fa-cart-shopping"></i> Menüyü Seç</button></div></div><div class="menu-body"><hr />${menu.content}</div>`;

    menus.appendChild(content);
  });

  document.querySelectorAll(".menu").forEach((menu) => {
    assign(menu.children[0], () => menu.classList.toggle("expanded"), false, true);
    assign(menu.children[1].children[0], () => menu.classList.toggle("expanded"), false, true);
    assign(menu.children[1].children[1].children[0], () => menu.classList.toggle("expanded"), false, true);
    assign(menu.children[1].children[1].children[1], () => menu.classList.toggle("expanded"), false, true);
    assign(
      menu.children[1].children[1].children[2],
      (event) => {
        selectedMenu = { ...selectedMenu, ...event.target.dataset };
        selectMenu();

        if (!localStorage.email) {
          notify("Sipariş vermek için üye olmanız gerekmektedir.");

          return;
        }
        load(orderButton, order);
      },
      false,
      true
    );
  });
}

async function selectMenu(selected = true) {
  if (!selectedMenu.id) return;

  if (selected) {
    changePromotion();
    return;
  }

  let response = await post("price.php", {
    id: selectedMenu.id,
    promotion: selectedMenu.promotion ? selectedMenu.promotion : "-",
    days: selectedMenu.days ? selectedMenu.days : 1,
    amount: selectedMenu.amount ? selectedMenu.amount : 1,
  });

  switch (response.status) {
    case "error":
      notify("Fiyat getirilirken bir problem oluştu, lütfen tekrar deneyiniz.");
      break;
    case "success":
      orderSection.menu.innerHTML = `<img src="./assets/images/menus/${selectedMenu.picture}"> ${selectedMenu.name}`;
      orderSection.price.innerHTML =
        response.price == response.original
          ? `${response.price}$`
          : `${response.price}$ <span>${response.original}$</span>`;
      break;
  }
}

async function getContents() {
  more.innerHTML = `<h2>Daha Fazla</h2>`;

  let data = await get("contents.php");

  if (data.status == "error") {
    let error = document.createElement("p");

    error.className = "fetch-error";

    error.innerHTML = "İçerikler getirilirken bir problem oluştu. Lütfen sayfayı yenileyiniz.";

    more.appendChild(error);

    return;
  }

  data.forEach((content) => {
    let blog = document.createElement("div");

    blog.className = "blog";

    blog.innerHTML = `<h4>${content.title}</h4><img src="./assets/images/temporary/${content.picture}" /><p>${content.description}</p><i class="fa-solid fa-xmark close"></i><div class="blog-content">${content.content}</div>`;

    more.appendChild(blog);
  });

  document.querySelectorAll(".blog").forEach((blog) => assign(blog, (event) => openPopUp(blog), false, true));

  document.querySelectorAll(".blog .close").forEach((close) => assign(close, closePopUp));
}

async function getLocations() {
  let data = await get("locations.php");

  orderSection.province.innerHTML = `<option hidden selected>İl</option>`;
  orderSection.district.innerHTML = `<option hidden selected>İlçe</option>`;

  if (data.status == "error") {
    notify("Konumlar getirilirken bir problem oluştu. Lütfen sayfayı yenileyiniz.");
    return;
  }

  data.provinces.forEach((province) => {
    orderSection.province.innerHTML += `<option value="${province.id}">${province.name}</option>`;
  });

  data.districts.forEach((district) => {
    orderSection.district.innerHTML += `<option value="${district.id}" data-province="${district.province_id}">${district.name}</option>`;
  });
}

/* =========={ Order }======================================== */

function changeProvince() {
  orderSection.district.selectedIndex = 0;

  if (!orderSection.province.selectedIndex)
    for (let index = 1; index < orderSection.district.children.length; index++)
      orderSection.district.children[index].hidden = false;
  else
    for (let index = 1; index < orderSection.district.children.length; index++) {
      orderSection.district.children[index].hidden = false;
      if (orderSection.province.selectedIndex != orderSection.district.children[index].dataset.province)
        orderSection.district.children[index].hidden = true;
    }
}

function changePromotion() {
  orderSection.promotionStatus.className = "loading";

  if (!orderSection.promotion.value) {
    orderSection.promotionStatus.className = "";
    delete selectedMenu.promotion;
    selectMenu(false);
    return;
  } else selectedMenu.promotion = orderSection.promotion.value;

  setTimeout(async () => {
    if (selectedMenu.promotion != orderSection.promotion.value) return;

    let response = await post("promotion.php", { code: selectedMenu.promotion });

    switch (response.status) {
      case "error":
        orderSection.promotionStatus.className = "error";
        break;
      case "success":
        orderSection.promotionStatus.className = "success";
        break;
    }

    selectMenu(false);
  }, 1000);
}

function changeDays() {
  selectedMenu.days = orderSection.days.value;
  selectMenu(false);
}

function changeAmount() {
  selectedMenu.amount = orderSection.amount.value;
  selectMenu(false);
}

async function completeOrder() {
  let company = orderSection.company.classList.contains("active");

  if (!selectedMenu.id) {
    notify("Lütfen menü seçiniz.");
    return;
  }

  if (orderSection.days.selectedIndex <= 0) {
    notify("Lütfen gün sayısını seçiniz.");
    return;
  }

  if (!orderSection.time.selectedIndex) {
    notify("Lütfen teslimat saatini seçiniz.");
    return;
  }

  if (!orderSection.name.value) {
    notify("Lütfen isminizi giriniz.");
    return;
  }

  if (!orderSection.phone.value) {
    notify("Lütfen telefonunuzu giriniz.");
    return;
  }

  if (!orderSection.email.value) {
    notify("Lütfen e-posta adresinizi giriniz.");
    return;
  }

  if (orderSection.province.selectedIndex <= 0) {
    notify("Lütfen ilinizi seçiniz.");
    return;
  }

  if (orderSection.district.selectedIndex <= 0) {
    notify("Lütfen ilçenizi seçiniz.");
    return;
  }

  if (!orderSection.address.value) {
    notify("Lütfen adresinizi giriniz.");
    return;
  }

  if (!orderSection.allergy.value) {
    notify("Lütfen alerji durumunuzu belirtiniz.");
    return;
  }

  if (!orderSection.disease.value) {
    notify("Lütfen kronik hastalık durumunuzu belirtiniz.");
    return;
  }

  if (!salesContract.classList.contains("checked")) {
    notify("Lütfen Satış Sözleşmesi metnini kabul ediniz.");
    return;
  }

  if (!KVKK.classList.contains("checked")) {
    notify("Lütfen KVKK metnini kabul ediniz.");
    return;
  }

  if (company) {
    if (
      !orderSection.taxNumber.value ||
      !orderSection.companyName.value ||
      !orderSection.taxAdministration.value ||
      !orderSection.taxMethod.selectedIndex ||
      !orderSection.companyAddress.value
    ) {
      notify("Lütfen şirket bilgilerini eksiksiz doldurunuz.");
      return;
    }
  } else {
    if (!orderSection.gender.selectedIndex) {
      notify("Lütfen cinsiyetinizi seçiniz.");
      return;
    }

    if (!orderSection.height.value) {
      notify("Lütfen boyunuzu giriniz.");
      return;
    }

    if (!orderSection.weight.value) {
      notify("Lütfen kilonuzu giriniz.");
      return;
    }
  }

  let response;

  inputLoading.classList.add("loading");

  if (company)
    response = await post("company-order.php", {
      id: selectedMenu.id,
      days: selectedMenu.days,
      time: orderSection.time.value,
      promotion: selectedMenu.promotion ? selectedMenu.promotion : "-",
      amount: selectedMenu.amount,
      name: orderSection.name.value,
      phone: orderSection.phone.value,
      email: orderSection.email.value,
      province: orderSection.province.value,
      district: orderSection.district.value,
      address: orderSection.address.value,
      allergy: orderSection.allergy.value ? orderSection.allergy.value : "-",
      disease: orderSection.disease.value ? orderSection.disease.value : "-",
      extra: orderSection.extra.value ? orderSection.extra.value : "-",
      taxNumber: orderSection.taxNumber.value,
      companyName: orderSection.companyName.value,
      taxAdministration: orderSection.taxAdministration.value,
      taxMethod: orderSection.taxMethod.value,
      companyAddress: orderSection.companyAddress.value,
    });
  else
    response = await post("order.php", {
      id: selectedMenu.id,
      days: selectedMenu.days,
      time: orderSection.time.value,
      promotion: selectedMenu.promotion ? selectedMenu.promotion : "-",
      amount: selectedMenu.amount ? selectedMenu.amount : 1, // For iPhone browsers.
      name: orderSection.name.value,
      phone: orderSection.phone.value,
      email: orderSection.email.value,
      province: orderSection.province.value,
      district: orderSection.district.value,
      address: orderSection.address.value,
      gender: orderSection.gender.value,
      height: orderSection.height.value,
      weight: orderSection.weight.value,
      allergy: orderSection.allergy.value ? orderSection.allergy.value : "-",
      disease: orderSection.disease.value ? orderSection.disease.value : "-",
      occupation: orderSection.occupation.value ? orderSection.occupation.value : "-",
      extra: orderSection.extra.value ? orderSection.extra.value : "-",
    });

  inputLoading.classList.remove("loading");

  switch (response.status) {
    case "error":
      notify("Sipariş tamamlanırken bir problem oluştu, lütfen tekrar deneyiniz.");
      break;
    case "success":
      // if (response.result.status == "return_url") location.href = response.result.returnUrl;
      // else notify("Sipariş tamamlanırken ödeme ile ilgili bir problem oluştu, lütfen tekrar deneyiniz.");
      W3SSDK.complete(
        response.data.appId,
        response.data.userToken,
        response.data.encryptionKey,
        response.data.challengeId
      );

      let interval = setInterval(async () => {
        let response = await get(
          `check.php?email=${orderSection.email.value}&price=${
            orderSection.price.innerHTML.split("$")[0]
          }&date=${new Date().getTime()}`
        );

        if (response.status == "success") {
          location.href = "https://fitgelsin.com/blockchain?fromOrderToUser";
          clearInterval(interval);
        }
      }, 1000);

      break;
  }
}

function redirectOrder() {
  if (location.href.split("?")[1] == "fromOrderToUser") {
    notify(
      "Ödemeniz başarıyla alınmıştır, siparişiniz şu an işleniyor. Siparişinizin detayları mail olarak iletilecektir. Sağlıklı günler dileriz."
    );
  }
  // let parameters = new Proxy(new URLSearchParams(location.search), {
  //   get: (parameters, property) => parameters.get(property),
  // });

  // if (parameters.payment) {
  //   redirectedNotification.innerHTML = `Ödemeniz başarıyla alınmıştır, siparişiniz şu an işleniyor.<br>${parameters.payment} numaralı siparişinizin detayları mail olarak iletilecektir. Uzman diyetisyen ekibimiz kayıtlı telefonunuzdan sizinle bir iş günü içinde iletişime geçecektir. Sağlıklı günler dileriz.`;
  //   redirectedNotification.style.display = "block";
  // }
}

function switchOrderType(company) {
  if (company) {
    orderSection.individual.classList.remove("active");
    orderSection.company.classList.add("active");
    companies.forEach((company) => (company.style.display = "block"));
    individuals.forEach((individual) => (individual.style.display = "none"));
  } else {
    orderSection.individual.classList.add("active");
    orderSection.company.classList.remove("active");
    companies.forEach((company) => (company.style.display = "none"));
    individuals.forEach((individual) => (individual.style.display = "block"));
  }
}

function auto() {
  orderSection.days.selectedIndex = 0; // For iPhone browsers.
  orderSection.amount.value = 1;

  if (!information) return;

  orderSection.name.value = information.name;
  orderSection.phone.value = information.phone;
  orderSection.email.value = information.email;
  orderSection.address.value = information.address;
}

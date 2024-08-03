load(homeButton, home);

setInterval(() => {
  slideTime += 1;

  if (slideTime == 5) {
    slideGoRight();
  }
}, 1000);

loginRememberedUser();

getLocations();

redirectOrder();

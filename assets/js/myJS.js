"use strict";

var desktopWidth = 1023;
var winWidth = 0;
var aR,
  wR,
  cR,
  aOffset,
  wOffset,
  cOffset,
  winHeight,
  aContentHeight,
  wContentHeight,
  cContentHeight,
  openedProjectID,
  currentProject,
  projectFire;

var commonPath = `assets/img/project/`;
var projectsTemaplateArr = [];
var workNavTemplateArr = [];

// moon init
var circle1 = {
  id: "r1",
  cx: 100,
  cy: 50,
  r: 40
};

var circle2 = {
  id: "r2",
  cx: 115,
  cy: 50,
  r: 40
};

var init = () => {
  // load configs

  // save data gloably
  // configDict = data;
  // append dom with configDict
  appendDom().then(() => {
    $(document).ready(function() {
      basicCalculationUpdate();
      desktopVSmobile();

      ininMoon(circle1);
      ininMoon(circle2);

      //#region 'events'
      $(window).scroll(function() {
        // var scrollTop = $('body').scrollTop;
        // var scrollTop = $("html, body").scrollTop();
        var scrollTop = $(document).scrollTop();
        // console.log(scrollTop);
        // console.log(scrollTop - aOffset);
        // console.log(scrollTop);

        //#region 'layout scroll control'
        if (winWidth >= desktopWidth) {
          var aboutL = "#aboutL";
          if (scrollTop - aOffset > 0) {
            startFix(aboutL);
            // basicCalculationUpdate();

            if (scrollTop - aOffset >= aContentHeight - winHeight) {
              endFix(aboutL);

              //if content height < winHeight
              if (aContentHeight >= winHeight) {
                adjustTop(aboutL);
              }
            }
          } else {
            endFix(aboutL);
          }

          var workL = "#workL";
          if (scrollTop - wOffset > 0) {
            startFix(workL);

            // if (projectFire) {
            //     var headerImageTop = scrollTop - wOffset;
            //     $('.header-image').css({"top": headerImageTop});
            // }

            if (scrollTop - wOffset > wContentHeight - winHeight) {
              endFix(workL);
              adjustTop(workL);
              basicCalculationUpdate();
            }
          } else {
            endFix(workL);
            $(".header-image").css({ top: 0 });
          }

          var contactL = "#contactL";
          if (scrollTop - cOffset > 0) {
            footerPageAppear();

            var scrollTopFooter =
              scrollTop - cOffset - (cContentHeight - winHeight);
            console.log(
              "Footer page relative scrollTop",
              scrollTopFooter,
              innerHeight
            );
            // moon control start
            moonScroll(scrollTopFooter);

            if (winHeight < cContentHeight) {
              startFix(contactL);
              if (scrollTop - cOffset >= cContentHeight - winHeight) {
                endFix(contactL);

                if (cContentHeight > winHeight) {
                  adjustTop(contactL);
                }
              }
            }
          } else {
            endFix(contactL);
            footerPageDisappear();
          }
        } else {
          if (projectFire) {
            var headerImageTop = scrollTop - wOffset;
            // $('.header-image').css({"top": headerImageTop});

            if (scrollTop - wOffset < 0) {
              $(".header-image").css({ top: 0 });
            }
          }
        }
        //#endregion
      });

      /* go to top after refresh */
      // $(window).scrollTop(0);

      $(window).resize(function() {
        basicCalculationUpdate();
        desktopVSmobile();
        // loadImage();

        // if (winWidth >= desktopWidth) {
        // }
      });

      $("div[id^='header-image-']").on("click", function() {
        console.log("project open cliked");
        openProject(this);
        highLightNav();
      });

      function openProject(that) {
        console.log(that);
        if (!projectFire) {
          projectFire = true;
          rightLineAppear();
          // setDisplay(false, "#more-info-logo");

          //disappear other projects
          //assign openedProjectID
          // project-4
          // openedProjectID = that.id;
          openedProjectID = that
            ? that.id.slice(that.id.lastIndexOf("-") + 1)
            : openedProjectID;
          // var openedProjectID = that.id.slice(that.id.lastIndexOf("-") + 1);
          var currentProject = $("#project-" + openedProjectID);
          projectDisapper(openedProjectID);
          // moreInfoLogoDisappear(currentProject);

          if (winWidth < desktopWidth) {
            scrollToHash(currentProject.find(".project-header"), 0);
            $("#mobile-close-project").css({
              display: "inline"
            });
          } else {
            // only show close button on desktop
            setDisplay(true, "#expand-close", "inline");
            startFix("#workL");
          }

          projectOpenCloseAnimation(true);
          projectShowContent(true, currentProject);
        } else {
          // projectFire = false;
        }
      }

      $("img[id^='next-project']").on("click", function() {
        nextProjectFuns();
      });

      function nextProjectFuns(that) {
        projectClose();
        scrollToHash(`#${getNextID()}`, 0);

        openProject(that ? that : undefined);
        scrollToHash(`#project-${openedProjectID}`, 0);
        highLightNav();
      }

      // click work-nav
      $("a[id^='work-nav-']").on("click", function() {
        if (!projectFire) {
          openProject(this);
          highLightNav();
        } else {
          nextProjectFuns(this);
        }
      });

      $("#expand-close").on("click", function() {
        projectClose();

        // put the hash ancor to the previous project with 0 speed
        var nextProject = getNextID();
        if (openedProjectID != 1) {
          scrollToHash(`#project-${openedProjectID - 1}`, 0);
        }
        scrollToHash(`#${nextProject}`, 1000);
      });

      $("#mobile-close-project").on("click", function() {
        $(".header-image").css({ top: 0 });

        $("#workL").removeClass("compress");
        $("#workR").removeClass("expand");
        // $("#mobile-close-project").css({"display":"none"});
        recoverProjects();

        //recalculate
        basicCalculationUpdate();

        //view focus to top project
        scrollToHash("#project-" + openedProjectID, 0);
        projectFire = false;

        $("#mobile-close-project").css({ display: "none" });
        console.log(this);
      });
      //#endregion
    });
  });
};

init();

//#region 'DOM related'
function loadContentImagesTemplate (index, obj, type){
  var imagesTemplate = [];

  obj.projectImages.forEach(url => {
    imagesTemplate.push(`<img src=${url}></img>`);
  });

  return imagesTemplate.join("");
};

function loadHeaderImageTemplate (key, obj, type) {
  var imageUrl = `${commonPath}${obj.projectName}/header-${type}.jpg`;

  $(`#project-${obj.projectID} .header-image`).css({
    // background-image: url("../../assets/img/project/bali/header-web.jpg");
    "background-image": `url(${imageUrl})`
  });
};

function generateProjectsTemplate (index, obj, imagesTemplateString) {
  var projectsTemplateString = `<!--${index}-->
                    <div class="project" id="project-${obj.projectID}">
                        <a href="#project-${
                          obj.projectID
                        }" class="project-header">
                            <div class="header-image" id="header-image-${
                              obj.projectID
                            }">
                                <!-- 
                                <div class="more-info" id="more-info-logo">
                                    <img src="assets/img/icon/next-right-white.png">
                                </div>
                                -->
                            </div>
                        </a>

                        <div class="project-content">
                            <div class="quotation-part">
                                <p>${obj.projectQuotation}</p>
                                <p class="quotation-date">${
                                  obj.projectQuotationDate
                                }</p>
                            </div>

                            <div class="project-details">
                                ${imagesTemplateString}
                            </div>

                            <div class="project-footer">
                                <div class="more-breadTrip-area">
                                    <p class="project-footer-disc">More</p>
                                    <a href="${
                                      obj.projectBreadLink
                                    }" target="_blank">
                                        <img src="assets/img/icon/more-breadTrip.png">
                                    </a>
                                </div>

                                <div class="more-breadTrip-area next-project-area">
                                    <p class="project-footer-disc">Next</p>
                                    <div>
                                        <img src="assets/img/icon/next-right-1.png" id="next-project">
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    `;
  return projectsTemplateString;
};

function generateWorkNavTemplate ( obj) {
  return `
    <li><a href="#project-${obj.projectID}" id="work-nav-${obj.projectID}">
      ${obj.projectName.charAt(0).toUpperCase() + obj.projectName.slice(1)}
    </a></li>`;
};

function appendDom() {
  return new Promise((resolve, reject) => {
    // generate projects dom
    $.each(configDict["project"], (index, projectVal) => {
      // wait to load images tempate string
      var imagesTemplateString = loadContentImagesTemplate(
        index,
        projectVal,
        "web"
      );

      // load project template
      // insert images template string to project template
      // push to projectsTemaplateArr
      projectsTemaplateArr.push(
        generateProjectsTemplate(index, projectVal, imagesTemplateString)
      );

      workNavTemplateArr.push(generateWorkNavTemplate(projectVal));
    });

    // wait projectsTemaplateArr resolved
    setTimeout(() => {
      // console.log(projectsTemaplateArr);
      $("#workR").append(projectsTemaplateArr.join(""));
      $("#work-nav").append(`<ul>${workNavTemplateArr.join("")}</ul>`);

      // add background image css for each project
      $.each(configDict["project"], (projectKey, projectVal) => {
        loadHeaderImageTemplate(projectKey, projectVal, "web");
      });

      resolve(true);
    }, 500);
  });
}
//#endregion

//#region 'support functions'
function desktopVSmobile() {
  if (winWidth >= desktopWidth) {
    $(".social-nav img").css({
      "max-height": "80px",
      "padding-right": "20px"
    });
    $("#workL").removeClass("bg-color-pink");
    $("#workL").removeClass("text-color-white");
  } else {
    $(".leftSide").removeClass("fixed");
    $(".leftSide").css({ top: 0 });
    $("#expand-close").css({ display: "none" });

    $("#workL").addClass("bg-color-pink");
    $("#workL").addClass("text-color-white");

    footerPageAppear();
  }
}

function basicCalculationUpdate() {
  winWidth = $(window).width();
  // console.log("window width" + winWidth);

  aR = $("#aboutR");
  wR = $("#workR");
  cR = $("#contactR");

  aOffset = aR.offset().top;
  wOffset = wR.offset().top;
  cOffset = cR.offset().top;

  winHeight = $(window).height();

  aContentHeight = aR.height();
  wContentHeight = wR.height();
  cContentHeight = cR.height();

  $(".chapterTitle").css({ "padding-top": winHeight * (1 - 0.618) });

  // console.log("aOffset:" + aOffset);
  // console.log("aContentHeight:" + aContentHeight);
}

function startFix(name) {
  $(name).addClass("fixed");
  $(name).css({ top: 0 });
}

function endFix(name) {
  $(name).removeClass("fixed");
  // console.log("end fix");

  basicCalculationUpdate();
}

function setDisplay(isDisplay, id, type) {
  if (isDisplay) {
    if (type) {
      $(id).css({ display: type });
    } else {
      $(id).css({ display: "block" });
    }
  } else {
    $(id).css({ display: "none" });
  }
}

// function moreInfoLogoAppear(currentProject) {
//   $(currentProject)
//     .find("div[id^='more-info-logo']")
//     .css({ display: "block" });
// }

// function moreInfoLogoDisappear(currentProject) {
//   $(currentProject)
//     .find("div[id^='more-info-logo']")
//     .css({ display: "none" });
// }
function highLightNav() {
  $(`#work-nav-${openedProjectID}`).addClass("text-color-pink");
}

function hideLightNav() {
  $(`#work-nav-${openedProjectID}`).removeClass("text-color-pink");
}

function rightLineAppear() {
  $("#workL").addClass("border-color-grey");
}

function rightLineDisappear() {
  $("#workL").removeClass("border-color-grey");
}

function projectOpenCloseAnimation(isOpen) {
  //expand width 75% 25%-+
  if (isOpen) {
    $("#workL").addClass("compress");
    $("#workR").addClass("expand");
  } else {
    $("#workL").removeClass("compress");
    $("#workR").removeClass("expand");
  }
}

function projectShowContent(isShow, currentProject) {
  if (isShow) {
    // set header image for 70% view height
    currentProject.find(".project-header").css({ height: "70vh" });
    // show project content
    currentProject.find(".project-content").css({ display: "inline" });
  }
}

function projectDisapper(projectID) {
  var projectList = $(".project");

  for (var i = 1; i <= projectList.length; i++) {
    if (i != projectID) {
      var projectIdDisappear = "#project-" + i;
      // console.log(project_id_disappear);
      $(projectIdDisappear).addClass("disappear");
    }
  }
}

function recoverProjects() {
  var project_list = $(".project");

  project_list.find(".project-content").css({ display: "none" });
  project_list.removeClass("disappear");
  project_list.find(".project-header").css({ height: "100vh" });
}

function projectClose() {
  // scroll to current headerImage
  scrollToHash(`#project-${openedProjectID}`, 0);

  projectFire = false;
  hideLightNav();
  rightLineDisappear();
  setDisplay(false, "#expand-close");
  // setDisplay(true, "#more-info-logo");
  // moreInfoLogoAppear(currentProject);

  projectOpenCloseAnimation(false);
  recoverProjects();
}

function getNextID() {
  console.log(projectsTemaplateArr);
  if (openedProjectID > projectsTemaplateArr.length - 1) {
    openedProjectID = 1;
  } else {
    openedProjectID++;
  }
  return `project-${openedProjectID}`;
}

function footerPageDisappear() {
  $(".footer-page").css({ display: "none" });
  // console.log("footer page disappear");
}

function footerPageAppear() {
  $(".footer-page").css({ display: "flex" });
  // console.log("footer page appear");
}

function adjustTop(name) {
  var topHeight = 0;
  switch (name) {
    case "#aboutL":
      topHeight = aContentHeight - winHeight;
      break;
    case "#workL":
      topHeight = wContentHeight - winHeight;
      break;
    case "#contactL":
      topHeight = cContentHeight - winHeight;
      break;
  }
  $(name).css({ top: topHeight });
}

function scrollToHash(hashName, speed) {
  // window.location = location.hash;
  // console.log(hashName);
  var dest = 0;
  if ($(hashName).offset().top > $(document).height() - $(window).height()) {
    dest = $(document).height() - $(window).height();
  } else {
    dest = $(hashName).offset().top;
  }
  $("html,body").animate({ scrollTop: dest }, speed, "swing");
}

// about moon
function moonScroll(scrollTop) {
  // basicCalculationUpdate();
  console.log("moonScrolling");

  updateMoonContainerPostion(scrollTop);

  var d = (circle1.r * scrollTop) / winHeight;

  if (scrollTop <= winHeight * (2 / 3)) {
    circle2.cx = circle1.cx + d;
    circle2.r = Math.sqrt(circle1.r * circle1.r - d * d);
    updateMoonShape(circle2);
  } else {
    // only update c2.cx, the rate is divided by left innerheight
    // relative scrollTop from this point: scrollTop - innerHeight * (2 / 3)
    // devide 1/3 to slow down the speed
    circle2.cx =
      circle1.cx +
      d +
      (((scrollTop - winHeight * (2 / 3)) * scrollTop) / winHeight) * (1 / 3);
    // circle2.cx = circle1.cx + d;

    updateMoonPosition(circle2);
  }
}

function ininMoon(circle) {
  $(`#${circle.id}`).attr("cx", circle.cx);
  $(`#${circle.id}`).attr("cy", circle.cy);
  $(`#${circle.id}`).attr("r", circle.r);
  $(`svg`).attr("transform", "rotate(-120)");
}

function updateMoonShape(circle) {
  $(`#${circle.id}`).attr("cx", circle.cx);
  $(`#${circle.id}`).attr("r", circle.r);
}

function updateMoonPosition(circle) {
  $(`#${circle.id}`).attr("cx", circle.cx);
}

function updateMoonContainerPostion(scrollTop) {
  $(`.moon-container`).css("padding-top", innerHeight - scrollTop);
}

//#endregion

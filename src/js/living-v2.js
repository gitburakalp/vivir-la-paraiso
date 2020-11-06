function getLangVal(lang) {
  var langVal = "tr";

  switch (lang) {
    case "tr":
      langVal = "tr-TR";
      break;
    case "en":
      langVal = "en-US";
      break;
    case "de":
      langVal = "de-DE";
      break;
    case "ru":
      langVal = "ru-RU";
      break;
  }

  return langVal;
}

const GetData = function () {};
const CurrentLang = getLangVal($("html").attr("lang"));

GetData.prototype.fromEvents = function (dateValue) {
  var arrayObj = [];
  //#region Date Assigments
  var date = new Date();
  var nextDate = new Date();

  var dateFrom = "",
    dateTo = "";

  if (dateValue == null) {
    dateFrom = getDDMMYYY(date);
    nextDate.setDate(nextDate.getDate() + 1);
    dateTo = getDDMMYYY(nextDate);
  } else {
    dateFrom = dateValue;
    var dateArray = dateValue.split(".");
    nextDate = new Date(dateArray[2], dateArray[1] - 1, dateArray[0]);
    nextDate.setDate(nextDate.getDate() + 1);
    dateTo = getDDMMYYY(nextDate);
  }

  //#endregion

  var apiUrl = `https://www.rubiplatinum.com/api/v1/events?LANG=${CurrentLang}&DATE_FROM=${dateFrom}&TIME_FROM=00:00&DATE_TO=${dateTo}&TIME_TO=00:00`;

  $.ajax({
    type: "get",
    url: apiUrl,
    contentType: "application/json",
    dataType: "json",
    async: false,
    success: function (response) {
      console.log(response);

      var responsedData = response.data;
      $.each(responsedData, (i, e) => {
        $.each(e.eventModels, (j, elem) => {
          elem.id = elem.eventId;
          elem.location =
            elem.labels != undefined
              ? elem.labels.split(",").find((x) => x.includes("Location")) !=
                undefined
                ? elem.labels.split(",").find((x) => x.includes("Location"))
                : ""
              : "";
          elem.location = elem.location
            .replace("Location", "")
            .replace("_", "");
          elem.images[0] != undefined
            ? (elem.imageLg = elem.images[0].path)
            : "";
          elem.images[1] != undefined
            ? (elem.imageMd = elem.images[1].path)
            : "";
          elem.images[2] != undefined
            ? (elem.imageSm = elem.images[2].path)
            : "";

          if (elem.endHour != undefined) {
            var endHourArray = elem.endHour.split(":");
            elem.endHour = endHourArray[0];
            elem.endMinute = endHourArray[1];
          }

          if (elem.startHour != undefined) {
            var startHourArray = elem.startHour.split(":");
            elem.startHour = startHourArray[0];
            elem.startMinute = startHourArray[1];
            elem.startValue =
              parseInt(elem.startHour * 60) + parseInt(elem.startMinute);
          }

          if (elem.startHour > endHourArray[0]) {
            elem.endValue =
              parseInt((elem.endHour + 24) * 60) + parseInt(elem.endMinute);
          } else {
            elem.endValue =
              parseInt(elem.endHour * 60) + parseInt(elem.endMinute);
          }

          arrayObj.push(elem);
        });
      });
    },
    failure: function (response) {
      console.log(response);
    },
  });

  arrayObj = arrayObj.sort((n, e) => {
    return n.startHour - e.startHour;
  });

  return arrayObj;
};

GetData.prototype.fromServices = (serviceType) => {
  var arrayObj = [];
  var servicesApiUrl = `https://www.rubiplatinum.com/api/v1/services?lang=${CurrentLang}`;

  $.ajax({
    type: "get",
    url: servicesApiUrl,
    contentType: "application/json",
    dataType: "json",
    async: false,
    success: function (response) {
      arrayObj = [];
      var responsedData = null;

      switch (serviceType) {
        case "FLA":
          responsedData = response.data.filter(
            (n) => n.serviceTypeName.toLowerCase() == "flavours"
          );

          break;
        case "SPA":
          responsedData = response.data.filter(
            (n) => n.serviceTypeName.toLowerCase() == "regius spa"
          );
          break;
      }

      $.each(responsedData, (i, el) => {
        console.log(responsedData);

        switch (serviceType) {
          case "SPA":
          case "FLA":
            $.each(el.subTenantServices, (j, elem) => {
              elem.imageSm =
                elem.images[2] != undefined ? elem.images[2].path : "";
              elem.imageMd =
                elem.images[1] != undefined ? elem.images[1].path : "";
              elem.imageLg =
                elem.images[0] != undefined ? elem.images[0].path : "";

              if (elem.endTime != undefined) {
                var elemEnd =
                  elem.endTime != undefined ? elem.endTime.split(":") : "";
                elem.endHour = elemEnd[0];
                elem.endMinute = elemEnd[1];
                elem.endValue =
                  parseInt(elemEnd[0] * 60) + parseInt(elemEnd[1]);
              }

              elem.location =
                elem.labels != undefined
                  ? elem.labels
                      .split(",")
                      .find((x) => x.includes("Location")) != undefined
                    ? elem.labels.split(",").find((x) => x.includes("Location"))
                    : ""
                  : "";
              elem.location = elem.location
                .replace("Location", "")
                .replace("_", "");

              arrayObj.push(elem);
            });
            break;
        }
      });
    },
    failure: function (response) {
      console.log(response);
    },
  });

  return arrayObj;
};

let getData = new GetData();

var getDDMMYYY = (dateval) => {
  var day = dateval.getDate().toString().padStart(2, "0"),
    month = (dateval.getMonth() + 1).toString().padStart(2, "0"),
    year = dateval.getFullYear();
  return `${day.slice(-2)}.${month.slice(-2)}.${year}`;
};

// #region Slider Variables
var $mainBlockInfoSection = $(".main-block__info-section"),
  $mainBlockSliderSection = $(".main-block__slider-section");

var mainSliderThumbs = null;
var mainSlider = null;

var sliderSlides = null,
  arrayOfSliderSlides = [],
  returnedJSON = [];
//#endregion

//#region propDate Variables
var date = new Date();
var thisHour = date.getHours() * 60 + date.getMinutes();
//#endregion

//#region Global Variables
const ww = $(window).width();
//#endregion

//#region Functions
var deleteAllSlides = function () {
  $mainBlockInfoSection.removeClass("show");
  $mainBlockInfoSection.find(".main-slider").remove();

  $mainBlockSliderSection.removeClass("show");
  $mainBlockSliderSection.find(".main-slider").remove();

  $mainBlockInfoSection.append(
    `<div class="main-slider main-slider--thumbs"><div class="main-slider__wrapper"></div></div>`
  );

  $(
    `<div class="main-slider main-slider--main"><div class="main-slider__wrapper"></div></div>`
  ).insertBefore($mainBlockSliderSection.find(".main-slider__controls"));
};

var createThumbsSlides = () => {
  var $mainBlockInfoSection = $(".main-block__info-section");

  $(".main-block__slider-section .main-slider__slide").each(function () {
    $this = $(this);
    var titleValue = $this.data("title");
    var descriptionValue = $this.data("description");
    var videoUrl = $this.data("videourl");
    var mainSliderElem = `<div class="main-slider__slide"><div class="info-section"><span class="info-section__title"><h3 class="main-block__title">${titleValue}</h3></span><span class="info-section__description"><p class="main-block__description">${descriptionValue}</p></span>${
      videoUrl != ""
        ? `<div class="row"><div class="col-12"><a data-elem="s-card__videoBtn" data-videourl="${videoUrl}" class="mt-3" data-toggle="modal" data-target="#videoPopup">Watch The Video</a></div></div>`
        : ""
    }</div></div>`;

    $mainBlockInfoSection.find(".main-slider__wrapper").append(mainSliderElem);
  });
};

var mainSliderThumbsInit = function () {
  var $mainBlockInfoSection = $(".main-block__info-section");
  var slidesNum = $mainBlockInfoSection.find(".main-slider__slide").length;

  mainSliderThumbs = new Swiper(".main-slider--thumbs", {
    slidesPerView: 3,
    touchRatio: 0.2,
    direction: "vertical",
    loop: true,
    loopedSlides: slidesNum,
    centeredSlides: true,
    speed: 1000,
    keyboard: true,
    slideToClickedSlide: 1,
    containerModifierClass: "main-slider--",
    wrapperClass: "main-slider__wrapper",
    slideClass: "main-slider__slide",
    slideActiveClass: "main-slider__slide--active",
    slideNextClass: "main-slider__slide--next",
    slidePrevClass: "main-slider__slide--prev",
    navigation: {
      nextEl: ".main-slider__controls .next",
      prevEl: ".main-slider__controls .prev",
    },
  });
};

var setPastSlides = function (endVal) {
  sliderSlides = document.querySelectorAll(
    ".main-slider--main .main-slider__slide:not(.swiper-slide-duplicate)"
  );
  arrayOfSliderSlides = Array.prototype.slice.call(sliderSlides);

  $.each(arrayOfSliderSlides, function () {
    endVal >= $(this).data("endvalue")
      ? $(this).addClass("main-slider__slide--past")
      : "";
  });
};

var mainSliderInit = function () {
  ww > 767 ? createThumbsSlides() : "";

  $(".main-block__slider-section")
    .find(".main-slider--main")
    .each(function () {
      var $this = $(this);
      var slidesNum = $this.find(".main-slider__slide").length;

      mainSlider = new Swiper($this, {
        slidesPerView: 2.5,
        spaceBetween: 50,
        loop: true,
        loopedSlides: slidesNum,
        // speed: 500,
        slideToClickedSlide: 1,
        containerModifierClass: "main-slider--",
        wrapperClass: "main-slider__wrapper",
        slideClass: "main-slider__slide",
        slideActiveClass: "main-slider__slide--active",
        slideNextClass: "main-slider__slide--next",
        slidePrevClass: "main-slider__slide--prev",
        breakpoints: {
          767: {
            slidesPerView: 1.75,
            spaceBetween: 0,
            // speed: 400,
            // touchRatio: 1.4,
            centeredSlides: true,
            loop: false,
          },
        },
        on: {
          init: function () {
            setPastSlides(thisHour);

            if (ww > 767) {
              mainSliderThumbsInit();

              $(".main-block__info-section").addClass("show");
              $(".main-block__slider-section").addClass("show");
            } else {
              $(".main-block__slider-section").addClass("show");
            }
          },
          transitionStart: function () {
            $(".main-bg").fadeOut(0);
          },
          transitionEnd: function (e, i) {
            var $activeSlide = $(
              ".main-slider--main .main-slider__slide--active"
            );
            var activeSlideStartValue = $activeSlide.data("startvalue");
            var imgUrl = document.querySelector(
              ".main-slider--main .main-slider__slide--active .slider-cards"
            ).style.backgroundImage;

            $(".main-bg").fadeOut(100);

            setTimeout(function () {
              $(".main-bg").attr("style", `background-image:${imgUrl}`);
            }, 250);

            $(".main-bg").fadeIn(500);

            // $(".timelineSlider").slider("value", activeSlideStartValue);
          },
        },
      });

      if (ww > 767) {
        mainSlider.controller.control = mainSliderThumbs;
        mainSliderThumbs.controller.control = mainSlider;
      }
    });
};

var timelineInit = function () {
  var config = {
    orientation: "vertical",
    range: "min",
    min: 480,
    max: 1800,
    step: 1,
    tooltips: true,
    value: thisHour,
    slide: function (e, ui) {
      var hours = Math.floor(ui.value / 60);
      var minutes = ui.value - hours * 60;

      if (hours.toString().length == 1) hours = "0" + hours;
      if (minutes.toString().length == 1) minutes = "0" + minutes;

      if (hours >= 24) {
        hours = hours - 24;
      }

      $(".timelineSlider .ui-slider-handle").html(
        `<span>${hours} : ${minutes}</span>`
      );
    },
    change: function (e, ui) {
      var hours = Math.floor(ui.value / 60);
      var minutes = ui.value - hours * 60;

      if (hours.toString().length == 1) hours = "0" + hours;
      if (minutes.toString().length == 1) minutes = "0" + minutes;

      if (hours >= 24) {
        hours = hours - 24;
      }

      $(".timelineSlider .ui-slider-handle").html(
        `<span>${hours} : ${minutes}</span>`
      );
    },
    stop: function (e, ui) {
      slideFunctions.slideTo(ui.value);
    },
    create: function () {
      var opt = $(this).data().uiSlider.options;
      var vals = (opt.max - opt.min) / 120;
      var currentTime = 0;

      for (var i = 0; i <= vals; i++) {
        var amount = (opt.min + currentTime) / 60;

        if (amount >= 24) {
          amount = amount - 24;
        }

        var el = $('<span class="circles">' + "" + "</span>").css(
          "top",
          "calc(" + (i / vals) * 100 + "%)"
        );
        currentTime = currentTime + 120;
        $(this).append(el);

        if (ww < 768) {
          $(this).on("click", function () {
            $(this).find('input[type="time"]').focus();
          });
        }
      }
    },
  };

  $(".timelineSlider").slider(config);

  var currentHour = Math.floor($(".timelineSlider").slider("value") / 60);
  var currentMinute = ($(".timelineSlider").slider("value") % 60).toString();

  $(".timelineSlider .ui-slider-handle").html(
    `<span>${currentHour}:${currentMinute.padStart(2, "0")}</span>`
  );
};

var appendSliderElems = function (serviceTypes, selectedDate) {
  switch (serviceTypes) {
    case "ENT":
      returnedJSON = getData.fromEvents(selectedDate);
      break;
    case "FLA":
    case "SPA":
      returnedJSON = getData.fromServices(serviceTypes);
      break;
  }

  returnedJSON.forEach((data) => {
    var sliderElem = `<div id="${
      data.id
    }" class="main-slider__slide" data-title="${data.name}" data-description="${
      data.description
    }" data-startvalue="${data.startValue}" data-endvalue="${
      data.endValue
    }" data-starthour="${data.startHour}" data-startminute="${
      data.startMinute
    }" data-endhour="${data.endHour}" data-endminute="${
      data.endMinute
    }" data-imagepath="${data.imageLg}" data-location="${
      data.location
    }" data-videourl="${
      data.videoUrl != undefined ? data.videoUrl : ""
    }"><div class="slider-cards" style="background-image:url('${
      data.imageLg
    }')"><div class="slider-cards__title-section"><h4 class="slider-cards__title" data-slide-elem="title">${
      data.name
    }</h4><div class="row"><div class="col-12 col-md"><span data-elem="times" data-slide-elem="times">${data.startHour
      .toString()
      .padStart(2, "0")}:${data.startMinute
      .toString()
      .padStart(2, "0")} - ${data.endHour
      .toString()
      .padStart(2, "0")}:${data.endMinute
      .toString()
      .padStart(
        2,
        "0"
      )}</span></div><div class="col-md-12 col-lg ml-lg-auto text-md-right"><span data-elem="location" data-slide-elem="location">${
      data.location
    }</span></div></div></div></div></div>`;

    $(".main-slider--main .main-slider__wrapper").append(sliderElem);
  });

  $('[data-elem="location"]').each((i, el) => {
    $(el).text() == "" ? $(el).parent().addClass("d-none") : "";
  });

  slideFunctions.slideTo();
};

var headerNavMenuInit = function () {
  $(".header-nav__menu-link").each(function () {
    $(this).on("click", function (e) {
      var $this = $(this);
      var idVal = $this.parent().attr("id");

      e.preventDefault();

      $(".header-nav__menu-item").removeClass("active");
      $this.parent().addClass("active");

      if (idVal != undefined) {
        deleteAllSlides();
        appendSliderElems(idVal);
        mainSliderInit();
        expandSlide();
      }
    });
  });

  $('[data-elem="dateButton"]').on("click", function () {
    $("#inpDatepicker").datepicker("show");
  });
};

var timeline = null;

var dateTimeline = function () {
  $(".timeline").each(function () {
    var dayCount = $("#hdnDayCount").val();
    var dateItems = $("#hdnStartDate").val().split(".");
    var firstDay = new Date(
      dateItems[2],
      parseInt(dateItems[1]) - 1,
      dateItems[0]
    );

    //üst takvim günleri oluşuyor
    for (var i = 0; i < dayCount; i++) {
      var lastWeek = new Date(
        firstDay.getFullYear(),
        firstDay.getMonth(),
        firstDay.getDate() + i
      );
      //moment.locale('en');
      //var monthNames = moment.monthsShort(true);//["Oca", "Sub", "Mar", "Nis", "May", "Haz", "Tem", "Agu", "Eyl", "Eki", "Kas", "Ara"];
      //var dayNames = moment.weekdaysShort(true);//m.localeData()._weekdaysShort;//["Pzr", "Pzt", "Sal", "Crs", "Prs", "Cu", "Cts"];
      var monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
      ];
      var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      var slides = $(
        ".timeline .timeline-slide:not(.swiper-slide-duplicate)"
      ).eq(i);
      slides.find("strong").text(lastWeek.getDate());
      var spanText = slides
        .find("span")
        .html(
          dayNames[lastWeek.getDay()] + "<br>" + monthNames[lastWeek.getMonth()]
        );
      slides.append(
        '<div style="display:none">' +
          ("0" + lastWeek.getDate()).slice(-2) +
          "." +
          ("0" + (lastWeek.getMonth() + 1)).slice(-2) +
          "." +
          lastWeek.getFullYear() +
          "</div>"
      );
    }

    var timelineConfig = {
      slidesPerView: 3,
      spaceBetween: 10,
      containerModifierClass: "timeline--",
      loop: true,
      slideToClickedSlide: 1,
      centeredSlides: true,
      wrapperClass: "timeline-wrapper",
      slideClass: "timeline-slide",
      slideActiveClass: "timeline-slide--active",
      slideNextClass: "timeline-slide--next",
      slidePrevClass: "timeline-slide--prev",
      disabledClass: "timeline-slide--disabled",
      navigation: {
        nextEl: ".timeline .next",
        prevEl: ".timeline .prev",
      },
      breakpoints: {
        768: {
          slidesPerView: 3,
        },
      },
      on: {
        init: function () {
          setTimeout(() => {
            timeline.on("transitionEnd", function (e) {
              var thisDate = $(
                ".timeline .timeline-slide--active p ~ div"
              ).text();

              var array = thisDate.split(".");
              var newDate = new Date(array[2], array[1] - 1, array[0]);
              $("#inpDatepicker").datepicker("setDate", newDate);

              deleteAllSlides();
              // appendSliderElems("ENT", thisDate);
              mainSliderInit();
              expandSlide();
            });
          }, 2000);
        },
      },
    };

    timeline = new Swiper($(this), timelineConfig);
  });
};

const Filter = function () {};

Filter.prototype.getByStartValue = (startVal, json) => {
  startVal == null ? (startVal = thisHour) : "";
  return returnedJSON.filter((n) => n.startValue == startVal);
};

Filter.prototype.getByEndValue = (endVal, json) => {
  return returnedJSON.filter((n) => n.endvalue == endVal);
};

let filterJson = new Filter();

const SlideFunctions = function () {};

SlideFunctions.prototype.slideTo = (uiValue) => {
  var firstOfSlide = null;

  uiValue == null ? (uiValue = thisHour) : "";
  setTimeout(function () {
    sliderSlides = document.querySelectorAll(
      ".main-slider--main .main-slider__slide:not(.swiper-slide-duplicate):not(.main-slider__slide--past)"
    );
    arrayOfSliderSlides = Array.prototype.slice.call(sliderSlides);

    firstOfSlide = arrayOfSliderSlides.filter(
      (el) => uiValue >= el.dataset.startvalue
    );

    firstOfSlide.length != 0
      ? mainSlider.slideTo($(firstOfSlide[firstOfSlide.length - 1]).index())
      : "";
  }, 20);
};

SlideFunctions.prototype.setPast = () => {};

let slideFunctions = new SlideFunctions();

var expandSlide = () => {
  if (ww < 768) {
    if (ww < 768) {
      var mainSliderSlides = document.querySelectorAll(
        ".main-slider--main .main-slider__slide"
      );

      var closeBtn = document.querySelector(
        ".slider-cards--details .close-btn"
      );

      closeBtn.addEventListener("click", function () {
        $(".slider-cards--details").removeClass("show");
      });

      mainSliderSlides.forEach((element) => {
        element.addEventListener("click", function () {
          $(".slider-cards--details").addClass("show");
          var thisData = this.dataset;

          var titleElem = document.querySelector("[data-elem='s-card__title']"),
            descriptionElem = document.querySelector(
              "[data-elem='s-card__description']"
            ),
            timeElem = document.querySelector("[data-elem='s-card__time']"),
            locationElem = document.querySelector(
              "[data-elem='s-card__location']"
            ),
            videoBtnElem = document.querySelector(
              ".slider-cards--details [data-elem='s-card__videoBtn']"
            );

          var title = thisData.title,
            description = thisData.description,
            startHour = thisData.starthour.toString().padStart(2, "0"),
            startMinute = thisData.startminute.toString().padStart(2, "0"),
            endHour = thisData.endhour.toString().padStart(2, "0"),
            endMinute = thisData.endminute.toString().padStart(2, "0"),
            location = thisData.location,
            backgroundImage = this.children[0].style.backgroundImage,
            videoUrl = thisData.videourl != undefined ? thisData.videourl : "";

          titleElem.innerHTML = title;
          descriptionElem.innerHTML = description;
          timeElem.innerHTML = `${startHour}:${startMinute} - ${endHour}:${endMinute}`;
          locationElem.innerHTML = location;
          $(".slider-cards--details").attr(
            "style",
            `background-image:${backgroundImage}`
          );
          videoBtnElem.dataset.videourl = videoUrl;
          videoUrl == ""
            ? videoBtnElem.classList.add("d-none")
            : videoBtnElem.classList.remove("d-none");
        });
      });
    }
  }
};

//#endregion

document.addEventListener("DOMContentLoaded", function () {
  var currentType = $(".header-nav__menu-item.active").attr("id");

  timelineInit();
  headerNavMenuInit();
  dateTimeline();
  appendSliderElems(currentType);
  mainSliderInit();

  window.onload = () => {
    expandSlide();
  };
});

$("#videoPopup").each(function () {
  var $this = $(this),
    iframeElem = "";

  $this.on("shown.bs.modal", function (e) {
    var iframeUrl = `${
      e.relatedTarget.dataset.videourl.includes(
        "https://www.youtube.com/embed/"
      )
        ? e.relatedTarget.dataset.videourl
        : `https://www.youtube.com/embed/${e.relatedTarget.dataset.videourl}`
    }`;
    var iframeProperties = "?autoplay=1&controls=1&showinfo=0&rel=0";
    iframeElem = $(this).find("iframe");
    iframeElem.attr("src", `${iframeUrl}${iframeProperties}`);
  });

  $this.on("hidden.bs.modal", function (e) {
    iframeElem.attr("src", "");
  });
});

$("#inpDatepicker").datepicker({
  dateFormat: "dd.mm.yy",
  buttonImageOnly: false,
  minDate: new Date(),
  beforeShow: function (input, inst) {
    $("body").addClass("datepick-open");

    if (ww > 767) {
      var $dateBtn = $('[data-elem="dateButton"]');
      var left = $dateBtn.offset().left;
      var top = $dateBtn.offset().top;

      setTimeout(() => {
        inst.dpDiv.css({ left: left + "px", top: top + 40 + "px" });
      }, 20);
    }
  },
  onClose: function (selectedDate) {
    $("body").removeClass("datepick-open");
    var thisDate = $(".timeline .timeline-slide--active p ~ div").text();

    if (selectedDate != "" && selectedDate != thisDate) {
      $(".timeline .timeline-slide:not([class*=duplicate]) p ~ div").each(
        function (i, e) {
          if ($(this).text().trim() == selectedDate) {
            timeline.slideTo($(this).closest(".timeline-slide").index());
          }
        }
      );
    }
  },
});

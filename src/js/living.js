$(document).ready(function () {
  // clockUpdate();
  setInterval(updateClock, 1000);
  var $thisActiveSlide = $('[data-slider="vertical"] > .slider-wrapper > .slider-slide--active > .slider-container > .slider-wrapper > .slider-slide--active');

  var thisSlideBigImage = $('.slider-slide--active').find('[data-bigimage-path]').data('bigimage-path');
  var thisSlideStartHour = $thisActiveSlide.data('starthour');
  var thisSlideEndHour = $thisActiveSlide.data('endhour');

  $('[data-timeElem]').text(thisSlideStartHour + ":00 - " + thisSlideEndHour + ":00");

  var $topImage = $('[data-sliders--top-image]');
  $topImage.attr('src', thisSlideBigImage);

  timeSliderFunc();
  sliderTabMenu();
  setLanguage();
  setPast();
});

function timeSliderFunc() {
  var $timeSlider = $('.sliders--bottom__time-slider-block .time-slider');

  $timeSlider.slider({
    min: 480,
    max: 1800, //1 gün 1440 dakikadan oluşmaktadır.
    step: 15, //15 dakikalık periyotlar ile slide edilecek.
    tooltips: true,
    slide: function (e, ui) {
      var hours = Math.floor(ui.value / 60);
      var minutes = ui.value - (hours * 60);

      if (hours.toString().length == 1) hours = '0' + hours;
      if (minutes.toString().length == 1) minutes = '0' + minutes;

      $('.ui-slider-handle:not(.passive)').html('<span class="ui-slider-tip">' + hours + ':' + minutes + '</span>')

      // $('#something').html(hours + ':' + minutes);
      // console.log($(e.target.children).append('<div>' + hours + ':' + minutes + '</div>'));
    }
  }).each(function () {
    var opt = $(this).data().uiSlider.options;
    var vals = (opt.max - opt.min) / 120;
    var currentTime = 0;

    for (var i = 0; i <= vals; i++) {
      var amount = ((opt.min + currentTime) / 60);

      if (amount >= 24) {
        amount = amount - 24;
      }

      var el = $('<span class="ui-slider-handle ui-corner-all ui-state-default passive">' + '<span class="tip">' + amount + ':00</span>' + '</span>').css('left', 'calc(' + (i / vals * 100) + '%)');
      // console.log(currentTime); 
      currentTime = currentTime + 120;
      $(this).append(el);
    }
  });

  var thisHour = $('.time').text().split(':')[0] * 60;

  $timeSlider.slider("option", "value", thisHour);
}

function sliderTabMenu() {
  $('.slider--tab-menu').each(function () {
    var $menuItem = $(this).find('.slider--tab-menu-item');

    $menuItem.on('click', function () {
      var $this = $(this);
      var activeCssClass = "active";
      var showTab = $this.data('show-tab');
      var fadeInCssClass = "fadeIn";

      $menuItem.removeClass(activeCssClass);
      $this.addClass(activeCssClass);

      $('.slider--tab-contents > *').removeClass(activeCssClass);
      $('.slider--tab-contents > *').removeClass(fadeInCssClass);

      $('.slider--tab-contents').find('[data-slide-type="' + showTab + '"]').addClass(activeCssClass);
      $('.slider--tab-contents').find('[data-slide-type="' + showTab + '"]').addClass(fadeInCssClass);
    });
  });
}


function setPast() {
  $(window).on('load', function () {
    var currentTime = parseInt($('.time').text().split(':')[0]);

    $('.slider-slide').each(function () {

      var $this = $(this);
      var slideEndHour = parseInt($this.data('endhour'));
      var slideDate = $this.data('date');
      var currentDate = new Date();

      function sameDay(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate();
      }

      if (slideDate !== undefined) {
        var convertedSlideDate = new Date(
          slideDate.split('.')[2],
          slideDate.split('.')[1] - 1,
          slideDate.split('.')[0]
        );

        if (currentDate.setHours(0, 0, 0, 0) > convertedSlideDate) {
          $this.addClass('slider-slide--past');
        } else if (sameDay(currentDate, convertedSlideDate)) {
          if (currentTime > slideEndHour) {
            $this.addClass('slider-slide--past');
          }
        }
      }
    });
  });
}

function updateClock() {
  var currentTime = new Date();
  // Operating System Clock Hours for 24h clock
  var currentHours = currentTime.getHours();
  // Operating System Clock Minutes
  var currentMinutes = currentTime.getMinutes();
  // Adding 0 if Minutes & Seconds is More or Less than 10
  currentMinutes = (currentMinutes < 10 ? "0" : "") + currentMinutes;
  // display first 24h clock and after line break 12h version
  var currentTimeString = currentHours + ":" + currentMinutes;
  // print clock js in div #clock.
  $(".time").html(currentTimeString);
}

function setLanguage() {
  $('.lang-list').each(function () {

    $(this).find('.lang-list__item .lang-list__link').on('click', function () {
      $('.lang-list__item').removeClass('active');
      $(this).closest('.lang-list__item').addClass('active');
    });

    $(this).on('click', function () {
      $(this).toggleClass('expand');
    });
  });
}

function clockUpdate() {
  var date = new Date();

  function addZero(x) {
    if (x < 10) {
      return x = '0' + x;
    } else {
      return x;
    }
  }

  function twelveHour(x) {
    if (x > 24) {
      return x = x - 24;
    } else if (x == 0) {
      return x = 24;
    } else {
      return x;
    }
  }

  var h = addZero(twelveHour(date.getHours()));
  var m = addZero(date.getMinutes());

  $('.time').text(h + ':' + m)
}

$('.timeline').each(function () {

  for (let i = 0; i < 3; i++) {
    var today = new Date();
    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);

    const monthNames = ["Oca", "Sub", "Mar", "Nis", "May", "Haz", "Tem", "Agu", "Eyl", "Eki", "Kas", "Ara"];
    const dayNames = ["Pzr", "Pzt", "Sal", "Çrş", "Prş", "Cu", "Cts"];

    var slides = $('.timeline .timeline-slide:not(.swiper-slide-duplicate)').eq(i);

    slides.find('strong').text(lastWeek.getDate());
    var spanText =
      slides.find('span').html(dayNames[lastWeek.getDay()] + "<br>" + monthNames[lastWeek.getMonth()]);
  }

  var timeline = new Swiper($(this), {
    slidesPerView: 3,
    spaceBetween: 10,
    loop: true,
    slideToClickedSlide: 1,
    centeredSlides: true,
    containerModifierClass: 'timeline--',
    wrapperClass: 'timeline-wrapper',
    slideClass: 'timeline-slide',
    slideActiveClass: 'timeline-slide--active',
    slideNextClass: 'timeline-slide--next',
    slidePrevClass: 'timeline-slide--prev',
    disabledClass: 'timeline-slide--disabled',
    navigation: {
      nextEl: '.timeline .next',
      prevEl: '.timeline .prev'
    },
    breakpoints: {
      768: {
        slidesPerView: 4
      }
    }
  });
});

$('[data-slider="vertical"]').each(function (i) {
  var $this = $(this);

  var verticalSlider = new Swiper($(this), {
    slidesPerView: 1,
    spaceBetween: 10,
    containerModifierClass: 'slider-container--',
    wrapperClass: 'slider-wrapper',
    slideClass: 'slider-slide',
    slideActiveClass: 'slider-slide--active',
    slideNextClass: 'slider-slide--next',
    slidePrevClass: 'slider-slide--prev',
    disabledClass: 'slider-slide--disabled',
    direction: 'vertical',
  });

  verticalSlider.on('slideChangeTransitionEnd', function () {
    var $slidersTop = $this.closest('.sliders--slides').closest('.sliders--bottom').prev();
    var $slideTypeElem = $('[data-slideType-elem]');
    var $activeSlide = $('[data-slider="vertical"] > .slider-wrapper > .slider-slide--active')
    var thisSlideType = $activeSlide.data('slide-type');
    var thisSlideTypeIcon = $activeSlide.data('slide-type-icon');

    $slidersTop.removeClass('active');
    $slidersTop.addClass('active');

    $('[data-controls-icon]').attr('src', thisSlideTypeIcon);

    $slideTypeElem.text(thisSlideType);
  });

  $this.find('.slider-slide__link').on('click', function (e) {
    var $slideTitleElem = $('[data-slideTitle-elem]');
    var $slideDescriptionElem = $('[data-slideDescription-elem]');
    var thisSlideTitle = $(this).find('[data-slide-title]').text();
    var thisSlideBigImage = $(this).find('[data-bigimage-path]').data('bigimage-path');
    var $topImage = $('[data-sliders--top-image]');
    var $slideTimeElem = $('[data-timeElem]');

    var thisSlideStartHour = $(this).parent().data('starthour');
    var thisSlideEndHour = $(this).parent().data('endhour');

    var shakeShake = "shakeShake";
    var swipeToLeft = "swipeToLeft";

    e.preventDefault();

    $slideTitleElem.removeClass(shakeShake);
    $topImage.removeClass('fadeIn');
    $slideDescriptionElem.removeClass(swipeToLeft);
    $topImage.attr('src', thisSlideBigImage);
    $slideTimeElem.text(thisSlideStartHour + ":00 - " + thisSlideEndHour + ":00");

    window.requestAnimationFrame(function () {
      setTimeout(function () {
        $slideTitleElem.text(thisSlideTitle);
        $slideTitleElem.addClass(shakeShake);
        $topImage.addClass('fadeIn');
        $slideDescriptionElem.addClass(swipeToLeft);
      }, 250)
    });
  });
});

$('[data-slider="horizontal"]').each(function (i) {
  var $this = $(this);

  var verticalSlider = new Swiper($this, {
    slidesPerView: 6,
    containerModifierClass: 'slider-container--',
    wrapperClass: 'slider-wrapper',
    slideClass: 'slider-slide',
    slideActiveClass: 'slider-slide--active',
    slideNextClass: 'slider-slide--next',
    slidePrevClass: 'slider-slide--prev',
    observer: true,
    observeParents: true,
    navigation: {
      nextEl: '.sh-controls .next',
      prevEl: '.sh-controls .prev'
    },
    breakpoints: {
      767: {
        slidesPerView: 2.75,
      },
      1279: {
        slidesPerView: 4
      }
    },
  });
});

$('[data-time-select-trigger]').on('click', function () {
  $(this).siblings().toggleClass('is-shown');
});

$('.dropdown--time').each(function () {
  var $this = $(this);

  $this.find('input[type="radio"]').on('change', function () {
    $('[data-time-select-trigger]').val($(this).siblings().text().trim());
    $this.find('*').removeClass('active');
    $(this).parent().addClass('active');
    $('.dropdown__menu-item').removeClass('is-shown');
  })
});

var initDatepicker = function () {
  var input = document.getElementById('inpDaterangepicker'),
    format = 'DD.MM.YYYY',
    currentDate = new Date(),
    startDateFecha = fecha.format(currentDate, format),
    endDateFecha = fecha.format(currentDate.setDate(currentDate.getDate() + 10), format);

  var urlParams = new URLSearchParams(window.location.search);
  var dateInfo = urlParams.get('DateInfo');

  if (dateInfo != undefined) {
    var dateArray = dateInfo.split('-');
    var startDate = new Date(convertToDate(dateArray[0]));
    var endDate = new Date(convertToDate(dateArray[1]));
    startDateFecha = fecha.format(startDate, format),
      endDateFecha = fecha.format(endDate, format);
  }

  var datepicker = new HotelDatepicker(input, {
    showTopbar: false,
    format: format,
    moveBothMonths: true,
  });

  datepicker.setRange(startDateFecha, endDateFecha);
};

function convertToDate(val) {
  var valArray = val.split('.');
  return `${valArray[1]}.${valArray[0]}.${valArray[2]}`;
}

initDatepicker();
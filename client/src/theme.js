(function() {
  'use strict';

  $(function() {
    $(window).scroll(function(){
      // add navbar opacity on scroll
      if ($(this).scrollTop() > 100) {
        $(".navbar.navbar-fixed-top").addClass("scroll");
      } else {
        $(".navbar.navbar-fixed-top").removeClass("scroll");
      }

      // global scroll to top button
      if ($(this).scrollTop() > 300) {
        $('.scrolltop').fadeIn();
      } else {
        $('.scrolltop').fadeOut();
      }
    });

    $('#myCarousel').carousel('cycle');

    // scroll back to top btn
    $('.scrolltop').click(function(){
      $("html, body").animate({ scrollTop: 0 }, 700);
      return false;
    });

    // scroll navigation functionality
    $('.scroller').click(function(){
      var section = $($(this).data("section"));
      var top = section.offset().top;
      $("html, body").animate({ scrollTop: top }, 700);
      return false;
    });

    // FAQs
    var $faqs = $("#faq .faq");
    $faqs.click(function () {
      var $answer = $(this).find(".answer");
      $answer.slideToggle('fast');
    });

    if (!$.support.leadingWhitespace) {
      //IE7 and 8 stuff
      $("body").addClass("old-ie");
    }

    $('a.login-window').click(function() {
      //Getting the variable's value from a link
      var loginBox = $(this).attr('href');

      //Fade in the Popup
      $(loginBox).fadeIn(300);

      //Set the center alignment padding + border see css style
      var popMargTop = ($(loginBox).height() + 24) / 2;
      var popMargLeft = ($(loginBox).width() + 24) / 2;

      $(loginBox).css({
        'margin-top' : -popMargTop,
        'margin-left' : -popMargLeft
      });

      // Add the mask to body
      $('body').append('<div id="mask"></div>');
      $('#mask').fadeIn(300);

      return false;
    });

    // When clicking on the button close or the mask layer the popup closed
    $('a.close, #mask').on('click', function() {
      $('#mask, .login-popup').fadeOut(300, function() {
        $('#mask').remove();
      });
      return false;
    });
  });
}());

// Add your custom JS code here
// DOES WORK
$('.gallery').slick({

    dots: true,
    infinite: false,
    speed: 300,
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
        {
            breakpoint: 4480,
            settings: 'unslick'
          },
      {
        breakpoint: 1024,
        settings: {
            settings: 'unslick'
        }
      },
      {
        breakpoint: 769,
        settings: {
            slidesToShow: 4,
            slidesToScroll: 4,
            dots: true,
            focusOnSelect: false,
            arrows: true,
            touchMove: false,
            draggable: true,
            swipe: true
        }
      },
      {
        breakpoint: 480,
        settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
            dots: true,
            focusOnSelect: false,
            arrows: true,
            touchMove: false,
            draggable: true,
            swipe: true
        }
      }
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ]
  });

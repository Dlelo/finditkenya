let lowToHigh = document.getElementById("low-to-high");
let highToLow = document.getElementById("high-to-low");

lowToHigh.addEventListener("click", function () {
    mainFilter("LowToHighPrice")
}, false);

highToLow.addEventListener("click", function () {
    mainFilter("HighToLowPrice")
}, false)

let apiData = [];
let priceFilter = []; //Sorted array
let result = []; //push html elements
let partial1 = '<ul class="products products--grid products--grid-condensed products--grid-light">';
let partial2 = "";
let endResult = "";

function fetchSortable() {
    let fetchData = $(document).ready(function () {
        $.get("/updatesearch2?type=product&search=smartphone", function (contents) {
            return apiData = contents.data;
        });
    });
}

function sift(filterChoice) {
    if (filterChoice === "LowToHighPrice") {
        pricefilter = [];
        priceFilter = apiData.sort(function (placeholder1, placeholder2) {
            return placeholder1.price - placeholder2.price;
        })
    } else {
        pricefilter = [];
        priceFilter = apiData.sort(function (placeholder1, placeholder2) {
            return placeholder2.price - placeholder1.price;
        })
    }
}

function priceFilterOptions() {
    priceFilter.forEach(function (data) {
        // Product Item
        let linkImage = "<a href=/product/item/" + data.slug + "><img src=uploads/product/thumbs/" + data.photo + "></img>" + "</a>";
        let productImage = "<div class='product__img'> <div class='div product__img-holder'>" + linkImage + "</div> </div>";
        // Card
        let productTitle = "<h2 class='product__title'><a href='singleproduct.html'>" + data.name + "</a>";
        let productPrice = "<div class='product__price'>" + data.price + "</div>";
        let productRatings = '<div class="product__ratings"><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star empty"></i></div>';
        let productCategory = "<span class='product__category'>" + data.bizid.category + "</span>"

        let productContent = '<div class="product__content card__content"><header class="product__header"><div class="product__header-inner">' + productCategory + productRatings + productTitle + productPrice + '</div></header></div>';

        let container = "<li class='product__item card'>" + productImage + productContent + "</li>";
        result.push(container);

        return result
    })
}

function concatPartials(item, index) {
    partial2 = partial2 + item;
}

function renderToDom() {
    result.forEach(concatPartials);
    endResult = partial1 + partial2 + "</ul>";
    //document.getElementsByClassName("products")[0].innerHTML = endResult;
    document.getElementById("product-filters").innerHTML = endResult;
}

// Call function mainReq(choice)
// Fetch api data
// if success
//sift(choice)
//priceFilterOptions()
//renderToDom()
// else
// Show error at id element

function mainFilter(option) {
    $(document).ready(function () {
        $.get("/updatesearch2?type=product&search=smartphone", function (contents) {
            apiData = [];
            priceFilter = [];
            result = [];
            partial2 = "";
            endResult = "";

            apiData = contents.data;
            sift(option);
            priceFilterOptions();
            renderToDom();
        })
    });
}
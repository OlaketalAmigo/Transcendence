
//////////////////////////////////////////////////////////////////////
// STAFF IMG CHANGING
let images = [
    "100.jpg", "101.jpg", "102.jpg", "103.jpg",
    "200.jpg", "201.jpg", "202.jpg", "203.jpg",
    "204.jpg", "205.jpg", "206.jpg", "207.jpg",
    "208.jpg", "226.jpg", "300.jpg", "301.jpg",
    "302.jpg", "303.jpg", "304.jpg", "305.jpg",
    "307.jpg", "308.jpg", "400.jpg", "401.jpg",
    "402.jpg", "403.jpg", "404.jpg", "405.jpg",
    "406.jpg", "407.jpg", "408.jpg", "409.jpg",
    "410.jpg", "411.jpg", "412.jpg", "413.jpg",
    "414.jpg", "415.jpg", "416.jpg", "417.jpg",
    "418.jpg", "420.jpg", "421.jpg", "422.jpg",
    "423.jpg", "424.jpg", "425.jpg", "426.jpg",
    "428.jpg", "429.jpg", "431.jpg", "444.jpg",
    "450.jpg", "451.jpg", "497.jpg", "498.jpg",
    "499.jpg", "500.jpg", "501.jpg", "502.jpg",
    "503.jpg", "504.jpg", "506.jpg", "507.jpg",
    "508.jpg", "509.jpg", "510.jpg", "511.jpg",
    "521.jpg", "522.jpg", "523.jpg", "525.jpg",
    "530.jpg", "599.jpg"
];
var currentIndex = 0;

function changeImage() {
    currentIndex = Math.floor(Math.random() * images.length);
    var randomImageElement = document.getElementById("randomImage");
    randomImageElement.src = '../web_cat_img/errors/' + images[currentIndex];
}
function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    var currentImage = document.getElementById("randomImage");
    currentImage.src = '../web_cat_img/errors/' + images[currentIndex]
}
function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    var currentImage = document.getElementById("randomImage");
    currentImage.src = '../web_cat_img/errors/' + images[currentIndex]
}
document.addEventListener('keyup', function(event) {
    // Check if the pressed key is the left arrow key
    if (event.key === 'ArrowLeft') {
        prevImage();}
    if (event.key === 'ArrowRight') {
        nextImage();}
    if (event.code === 'Space') {
        event.preventDefault();
        changeImage();}
});
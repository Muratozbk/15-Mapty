'use strict';
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

console.log('hello')
let map, mapEvent;
if (navigator.geolocation)
    navigator.geolocation.getCurrentPosition(function (position) {
        console.log(position)
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        const coords = [latitude, longitude];
        console.log(coords)
        map = L.map('map').setView(coords, 13);

        L.tileLayer('https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        map.on('click', function (mapE) {
            form.classList.remove('hidden');
            inputDistance.focus()
            mapEvent = mapE;
            console.log(mapE)

        })


    }, function () {
        alert('Could not get your position')
    })

form.addEventListener('submit', function (e) {
    e.preventDefault();
    console.log('submit')
    L.marker(mapEvent.latlng).addTo(map)
        .bindPopup(L.popup({
            closeOnClick: false, autoClose: false,
            maxWidth: 250, minWidth: 100, className: 'running-popup'
        }))
        .setPopupContent('Workout<br> Easily')
        .openPopup();
    inputDistance.value = '';
    form.classList.add('hidden')
})
inputType.addEventListener('change', function () {
    inputElevation.closest('div').classList.toggle('form__row--hidden');
    inputCadence.closest('div').classList.toggle('form__row--hidden')
})
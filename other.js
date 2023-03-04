'use strict';
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map, mapEvent;

class App {
    #map;
    #mapEvent;

    constructor() {
        this._getPosition();
        this._toggleElevetion();
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevetion)
    }
    _getPosition() {

        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),
                function () {
                    alert('Could not get your position')
                })
    }

    _loadMap(position) {
        console.log(position)
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        const coords = [latitude, longitude];
        console.log(coords)
        this.#map = L.map('map').setView(coords, 13);

        L.tileLayer('https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        this.#map.on('click', this._showForm.bind(this))
    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus()
        console.log(mapE)
    }


    _toggleElevetion() {
        inputElevation.closest('div').classList.toggle('form__row--hidden');
        inputCadence.closest('div').classList.toggle('form__row--hidden')
    }


    _newWorkout(e) {
        e.preventDefault();

        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
        console.log('submit');
        const { lat, lng } = this.#mapEvent.latlng;
        L.marker([lat, lng]).addTo(this.#map)
            .bindPopup(L.popup({
                closeOnClick: false, autoClose: false,
                maxWidth: 250, minWidth: 100, className: 'running-popup'
            }))
            .setPopupContent('Workout')
            .openPopup();
        form.classList.add('hidden')
    }
}
const app = new App();
// app._getPosition();



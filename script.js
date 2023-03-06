'use strict';
//237 Refactoring IMPORTANT 
// prettier-ignore

class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10); //Stringe çevirdi ve son 10u aldı
    clicks = 0;

    constructor(coords, distance, duration) {
        this.coords = coords; // [lat,lng]
        this.distance = distance; // in km
        this.duration = duration; //in min
    }

    _setDescription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }
    click() {
        this.clicks++;
    }
}

class Running extends Workout {
    type = 'running';
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
    }
    calcPace() {
        //min/km
        this.pace = this.duration / this.distance
        return this.pace;
    }
}

class Cycling extends Workout {
    type = 'cycling';
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
        this._setDescription();
    }
    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
};


// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 578);
// console.log(run1, cycling1)

///////////////////////
// Aplication Architecture
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const deleteAllBtn = document.querySelector('.delete__all__button');


class App {
    #map;
    #mapZoomLevel = 13;
    #mapEvent;
    #workouts = [];

    constructor() {
        //Get users's position
        this._getPosition(); // app._getPosition() execute the code

        // Get data from local storage
        this._getLocalStorage()

        // Attach Event handlers
        form.addEventListener('submit',
            this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
        containerWorkouts.addEventListener('click',
            this._moveToPopup.bind(this));

        //Delete All Inputs
        deleteAllBtn.addEventListener('click', this.reset)
        //delete workout
        containerWorkouts.addEventListener('click', this._deleteWorkout.bind(this))
    }

    _getPosition() {
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this),
                function () {
                    alert('Could not get your position')
                });
    }

    _loadMap(position) {
        // const latitude = position.coords.latitude;
        const { latitude } = position.coords; //Destructuring
        const { longitude } = position.coords;
        console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
        const coords = [latitude, longitude];
        this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
        // console.log(map)
        L.tileLayer(`https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png`, {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
        // L.marker(coords).addTo(map)
        //     .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
        //     .openPopup();

        this.#map.on('click', this._showForm.bind(this));

        this.#workouts.forEach(work => {
            this._renderWorkoutMarker(work)
        });
    }

    _onMapClick(mapE) {
        if (!form.classList.contains('hidden')) {
            this.#mapEvent = mapE;
            this._refreshMap();
            this._renderTempMarker(mapE.latlng, 'New');
            inputDistance.focus();
        } else {
            this._showForm(mapE);
        }
    }
    _refreshMap(coords) {
        // Storing current map center to plug into _loadMap on next load:
        const currentCoords = !coords
            ? {
                coords: {
                    latitude: this.#map.getCenter().lat,
                    longitude: this.#map.getCenter().lng,
                },
            }
            : coords;

        // Reloading the map:
        this.#map.remove();
        this._loadMap(currentCoords);
    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus(); // distance text write 
    }

    _hideForm() {
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => form.style.display = 'grid', 1000)
    }

    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
        inputCadence.closest('div').classList.toggle('form__row--hidden')
    }

    _newWorkout(e) {
        e.preventDefault();
        const validInputs = (...inputs) =>
            inputs.every(inp => Number.isFinite(inp));

        const allPositive = (...inputs) =>
            inputs.every(inp => inp > 0)

        // Get data from the from
        const type = inputType.value;
        const distance = +inputDistance.value; //convert to number+
        const duration = +inputDuration.value;
        const { lat, lng } = this.#mapEvent.latlng;
        let workout;

        // If workout runing, Create running object
        if (type === 'running') {
            const cadence = +inputCadence.value;
            // Check if data valid
            if (
                // !Number.isFinite(distance) ||
                // !Number.isFinite(duration) ||
                // !Number.isFinite(cadence)
                !validInputs(distance, duration, cadence) ||
                !allPositive(distance, duration, cadence)
            )
                return alert('Input have to be positive numbers!');

            workout = new Running([lat, lng], distance, duration, cadence)

        }
        //If workout cycling, Create cycling object
        if (type === 'cycling') {
            const elevation = +inputElevation.value;
            if (
                !validInputs(distance, duration, elevation) ||
                !allPositive(distance, duration)
            )
                return alert('Input have to be positive numbers!');

            workout = new Cycling([lat, lng], distance, duration, elevation)
        }
        //Add new object to workout array
        this.#workouts.push(workout);

        // Render workout on map as marker
        this._renderWorkoutMarker(workout)

        // Render workout on list 
        this._renderWorkout(workout);
        //hide the form +
        // Clear input fields;
        this._hideForm();

        // Set local storage to all workouts
        this._setLocalStorage();
    }

    _renderWorkoutMarker(workout) {
        L.marker(workout.coords).addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`, //inputType.value cycling-running
            }))
            .setPopupContent(`${workout.description}`)
            .openPopup();
    }

    _renderWorkout(workout) {
        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__edit__btn__box">
        <button class="edit__btn">🔨</button>
          </div>
        <div class="workout__delate__btn__box">
        <button class="delete__btn">❌</button>
          </div>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
     `

        if (workout.type === 'running')
            html += ` <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>`;

        if (workout.type === 'cycling')
            html += ` <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed.toFixed(1)}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevationGain}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>`;
        form.insertAdjacentHTML('afterend', html);
    }

    _moveToPopup(e) {
        const workoutEl = e.target.closest('.workout');

        if (!workoutEl) return;

        const workout = this.#workouts.find(work =>
            work.id === workoutEl.dataset.id);

        this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1
            }
        })
        // Using public interface
        // workout.click();
    }

    _setLocalStorage() {
        localStorage.setItem('workout',
            JSON.stringify(this.#workouts))
        //JSON.stringify convert any object to string--
    }

    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('workout'))
        if (!data) return;

        this.#workouts = data;

        this.#workouts.forEach(work => {
            this._renderWorkout(work);
        })
    }
    reset() { // app.reset()
        localStorage.removeItem('workout');
        location.reload();
    }

    _refreshCards() {
        this._setLocalStorage();
        containerWorkouts.querySelectorAll('.workout')
            .forEach(el => el.remove());
        // this._getLocalStorage();
    }

    _deleteById(id) {
        if (this.#workouts.length > 0) {
            this.#workouts = this.#workouts.filter(e => e.id !== id);
            // Removing the card:
            this._refreshCards();

            // Removing the marker:
            this._refreshMap();
        }
    }
    _deleteWorkout(e) {
        const workoutEl = e.target.closest('.delete__btn');
        if (!workoutEl) return;

        console.log(workoutEl, this.#workouts)
        // this.#workouts.pop();
        this._deleteById(workoutEl.dataset.id)
    }

}

const app = new App();


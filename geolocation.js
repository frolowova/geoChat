"use strict";

const blockMessages = document.querySelector(".mesages")
const textMessage = document.querySelector(".textMessage")
const goBtn = document.querySelector(".goBtn")
const positions = [
	{ lat: 59.99019129516602, lng: 30.30658948120117, mess: "0,xxx" },
	{ lat: 59.99049129516602, lng: 30.30718948120117, mess: "1,xxx" },
	{ lat: 59.99118129516602, lng: 30.30639948120117, mess: "2,xxx" },
	{ lat: 59.99629129516602, lng: 30.30648948120117, mess: "3,xxx" }
]
const radius = {
	lat: 0.001,	// +- 100m
	lng: 0.0015	// +- 100m
}
const coordinates = {
	lat: -1,
	lng: -1
}


function createPointPosition() {

	if (!navigator.geolocation) {
		// 
		console.log("Ne Vasya")
	} else {
		/*Так как нам сперва надо получить разрешение от пользователя
		на доступ к геопозиции, то остальной код выполняем, пока не выполнится этот*/
		navigator.geolocation.getCurrentPosition(function (position) {
			document.querySelector("#map").innerHTML = ""

			coordinates.lat = position.coords.latitude
			coordinates.lng = position.coords.longitude

			showOnlyValuesInRadius(radius, coordinates)

			const textYourCity = document.querySelector(".geoposition")
			let city = ""
			fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=953f4b51-a91c-4538-b3aa-ddb3ae2f6afc&format=json&geocode=${coordinates.lng},${coordinates.lat}&kind=locality`)
				.then(response => response.json())
				.then(response => response.response.GeoObjectCollection)
				.then(res => {
					city = res.featureMember[0].GeoObject.name
					textYourCity.innerHTML = ("Пользователь из города: " + city)
					console.log(coordinates.lng + ", " + coordinates.lat)
					viewMap(coordinates.lng, coordinates.lat);
				})
				// .then(adress => console.log(adress))
				.catch(err => {
					console.log(err);
				})

		}, function (err) {
			console.log(`ERROR(${err.code}): ${err.message}`);
		})
	}
}


// Проверяем входит ли значения позиции в указанный радиус
function showOnlyValuesInRadius(radius, coordinates) {
	positions.forEach(element => {
		if (element.lat > (coordinates.lat - radius.lat) && element.lat < (coordinates.lat + radius.lat)) {
			if (element.lng > (coordinates.lng - radius.lng) && element.lng < (coordinates.lng + radius.lng)) {
				console.log("Попал в радиус")
				blockMessages.innerHTML += "\n" + "<p>" + element.mess + "</p>"
				console.log(blockMessages)
			} else {
				console.log("Долгота не в радиусе")
			}
		} else {
			console.log("Широта не в радиусе")
		}
	});
}

// });

// }

// Отображение карты
function viewMap(lng, lat) {
	let myMap;
	console.log("lng=" + lng + ", lat=" + lat);

	// Дождёмся загрузки API и готовности DOM.
	ymaps.ready(init);

	function init() {
		// Создание экземпляра карты и его привязка к контейнеру с
		// заданным id ("map").
		myMap = new ymaps.Map('map', {
			// При инициализации карты обязательно нужно указать
			// её центр и коэффициент масштабирования.
			center: [lat, lng], // Наши координаты
			zoom: 17,
			controls: ['smallMapDefaultSet'] //Связано с опцией ограничения области просмотра карты
		}, {
			// Зададим ограниченную область прямоугольником, 
			// с указанием примерного радиуса
			restrictMapArea: [
				[(lat - radius.lat), (lng - radius.lng)],
				[(lat + radius.lat), (lng + radius.lng)]
			]
		}, {
			searchControlProvider: 'yandex#search'
		});

		//    document.getElementById('destroyButton').onclick = function () {
		//        // Для уничтожения используется метод destroy.
		//        myMap.destroy();
		//	};
		goBtn.addEventListener("click", addMessage)

		function addMessage() {
			let mess = textMessage.value
			positions.push({ "lat": coordinates.lat + 0.0001, "lng": coordinates.lng + 0.0001, "mess": mess })
			textMessage.value = ""
			blockMessages.innerHTML += "<p>" + mess + "</p>"
			console.log(mess)
			console.log(positions)
			// myMap.destroy();	// Удаляем карту, потому что будем рисовать новую.
			// createPointPosition()
		}

		// Коллекция (массив) всех имеющихся геопозиций
		const positionsCollection = new ymaps.GeoObjectCollection(null, {
			preset: 'islands#greenIcon'
		});
		for (var i = 0; i < positions.length; i++) {
			positionsCollection.add(new ymaps.Placemark([positions[i].lat, positions[i].lng], {
				// iconCaption: i
				iconContent: i
			}));
		}

		// Создаем геообъект с типом геометрии "Точка".
		const myGeoObject = new ymaps.GeoObject({
			// Описание геометрии.
			geometry: {
				type: "Point",
				coordinates: [lat, lng]
			},
			// Свойства.
			properties: {
				// Контент метки.
				iconContent: 'Я',
				hintContent: 'Ваше ориентировочное положение'
			}
		});

		const talismanGeoObject = new ymaps.Placemark([(lat + 0.0005), (lng - 0.0005)], {
			balloonContent: 'Текст подсказки',
			iconCaption: 'Талисман'
		}, {
			preset: 'islands#redCircleDotIconWithCaption',
			iconCaptionMaxWidth: '50'
		});

		// Размещение геообъекта(-ов) на карте.
		myMap.geoObjects
			.add(myGeoObject)
			// .add(talismanGeoObject);
			// //Показываем всю коллекцию позиций, которые попали в радиус от положения пользователя
			.add(positionsCollection)

		// Через коллекции можно подписываться на события дочерних элементов.
		// Это пример
		positionsCollection.events.add('click', function (e) {
			alert("Кликнули по сообщению");
			console.dir(e)
		});


	}
}
// }



createPointPosition();



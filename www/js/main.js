const $resultado = document.querySelector("#resultado");
const API_URL = "https://api.getgeoapi.com/v2/currency";
const API_KEY = "bd33914bd3e328b0df2b814c48326ec4a5b9ba88";
const MAX_CRYPTO = 50


const $form = document.querySelector("#form-converter");
$form.addEventListener("submit", submitConvertirMoneda);

const $form2 = document.querySelector("#form-historico");
$form2.addEventListener("submit", submitHistoricoMoneda);

let busqueda;


pickerEnDiaActual();
obtenerListadoMonedas();
obtenerListadoCryptomonedas();

function pickerEnDiaActual() {
    const picker = document.getElementById("inp-fecha")
    const fechaActual = new Date()
    picker.value = formatearFecha(fechaActual)
}

function obtenerValoresForm() {
    const monto = document.querySelector("#inp-monto").value;
    const monedaPeso = document.querySelector("#sel-moneda-peso").value;
    const monedaCrypto = document.querySelector("#sel-moneda-crypto").value;
    const fecha = document.querySelector("#inp-fecha").value;

    busqueda = {
        monto: monto,
        monedaPeso: monedaPeso,
        monedaCrypto: monedaCrypto,
        fecha: fecha
    };
}
function obtenerListadoMonedas() {
    fetch(`${API_URL}/list?api_key=${API_KEY}`)
        .then(apiToJson)
        .then(escribirListadoMonedas)

}
function obtenerListadoCryptomonedas() {

    fetch(`https://api.coinpaprika.com/v1/coins`)
        .then(apiToJson)
        .then(escribirListadoCryptomonedas)

}
function escribirListadoCryptomonedas(dataCrypto) {
    dataCrypto = dataCrypto.slice(0, MAX_CRYPTO)

    let optionsHtml = "<option selected disabled>Seleccione la moneda</option>";
    for (let cryptomoneda of dataCrypto) {
        optionsHtml +=
            `<option value="${cryptomoneda.id}">${cryptomoneda.name}-${cryptomoneda.symbol}</option>`;
    }
    document.querySelector("#sel-moneda-crypto").innerHTML = optionsHtml;
}

function escribirListadoMonedas(dataApi) {

    const monedas = Object.keys(dataApi.currencies);

    let optionsHtml = "<option selected disabled>Seleccione la moneda</option>";
    for (let monedaId of monedas) {
        optionsHtml +=
            `<option value="${monedaId}">${dataApi.currencies[monedaId]}</option>`;
    }

    document.querySelector("#sel-moneda-peso").innerHTML = optionsHtml;
}


function submitConvertirMoneda(evento) {
    evento.preventDefault();

    obtenerValoresForm();

    console.table(busqueda)

    fetch(`${API_URL}/historical/${busqueda.fecha}?api_key=${API_KEY}&from=${busqueda.monedaPeso}&to=USD&amount=${busqueda.monto}`)
        .then(apiToJson)
        .then(escribirMonedaConvertida)
}


function submitHistoricoMoneda(evento) {
    evento.preventDefault();

    obtenerValoresForm();

    console.table(busqueda)

    const fechaCalculada = restar10Dias(busqueda.fecha);
    console.log("fecha calculada", fechaCalculada);

    fetch(`https://api.coinpaprika.com/v1/coins/${busqueda.monedaCrypto}/ohlcv/historical?start=${fechaCalculada}&end=${busqueda.fecha}`)
        .then(apiToJson)
        .then(escribirHistoricoMoneda);
}

function restar10Dias(fecha) {
    const dateUsuario = new Date(fecha);

    dateUsuario.setDate(dateUsuario.getDate() - 5);

    const fechaFormateada = formatearFecha(dateUsuario)
    return fechaFormateada;
}

function formatearFecha(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    console.log(year, month, day);

    const formattedMonth = `${month}`.padStart(2, "0");
    const formattedDay = day.toString().padStart(2, "0");


    return `${year}-${formattedMonth}-${formattedDay}`;
}

function obtenerDiaDeFecha(objDia) {
    const date = objDia.time_close.split("T")[0];
    const dateDay = date.split("-")[2];
    return dateDay
}

function obtenerCloseAndRound(objDia) {
    return Math.round(objDia.close);
}

function escribirHistoricoMoneda(dataApi) {
    console.log(dataApi)

    const dataLabels = dataApi.map(obtenerDiaDeFecha);
    const closeData = dataApi.map(obtenerCloseAndRound);

    const data = {
        labels: dataLabels,
        series: [closeData]
    };

    new Chartist.Line('.ct-chart', data);
}

function apiToJson(respuesta) {
    console.log(respuesta);
    return respuesta.json();
}


function escribirMonedaConvertida(dataApi) {
    console.log(dataApi)
    const monedaConvertidaUSD = dataApi.rates["USD"].rate;

    fetch(`https://api.coinpaprika.com/v1/coins/${busqueda.monedaCrypto}/ohlcv/historical?start=${busqueda.fecha}&end=${busqueda.fecha}`)
        .then(apiToJson)
        .then((i) => mostrarResultados(i, monedaConvertidaUSD))
}

function mostrarResultados(dataCrypto, monedaConvertidaUSD) {

    console.log(dataCrypto)
    const cryptoConvertidaUSD = dataCrypto[0].close
    const cotizacion = cryptoConvertidaUSD / monedaConvertidaUSD;
    const cotizacionMonto = Math.round(cotizacion * busqueda.monto)
    const strMonedaCrypto = `${busqueda.monto} ${busqueda.monedaCrypto}`;
    const strMonedaPeso = `${cotizacionMonto} ${busqueda.monedaPeso}`;

    $resultado.innerHTML = `
        <h3>${strMonedaCrypto} son ${strMonedaPeso} </h3>
    `
        ;
}



/* Getting historical OHLCV data before 2022-05-26 18:31:04.223373695 +0000 UTC is not allowed in this plan. Check plans on coinpaprika.com/api */
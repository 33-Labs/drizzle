const convertCadenceDateTime = (rawDate) => {
  return new Date(parseFloat(rawDate) * 1000)
}

const getTimezone = () => {
  return (new Date()).toTimeString().slice(9).split(" ")[0]
}

const utils = {
  convertCadenceDateTime,
  getTimezone
}

export default utils
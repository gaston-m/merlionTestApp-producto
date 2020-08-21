import axios from 'axios'

export const api = (method, endpoint, headers, _data) =>
  new Promise((resolve, reject) => {
    
    const url = `api/${endpoint}`

    axios({
      data: _data,
      headers,
      method,
      url
    })
      .then(({ data }) => {
        resolve(data)
      })
      .catch((err) => {
       // console.log(err)
        reject(err)
      })
  })
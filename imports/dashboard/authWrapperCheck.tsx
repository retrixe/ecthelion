import config from '../../config.json'

const authWrapperCheck = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return
    const servers = await fetch(config.ip + '/servers', { headers: { Authorization: token } })
    await servers.json()
    if (servers.ok) return true
    else return false
  } catch (e) {}
}

export default authWrapperCheck

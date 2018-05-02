export async function myFetch(username) {
  let url = `https://api.github.com/users/${username}`
  let res = await fetch(url);
  return await res.json()
}

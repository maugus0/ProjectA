async function checkFollowBack() {
  async function fetchAllPages(url) {
    let items = [];
    let page = 1; // Initialize page variable
    while (true) {
      let response = await fetch(`${url}?per_page=100&page=${page}`);
      if (!response.ok) break;
      let data = await response.json();
      if (data.length === 0) break;
      items = items.concat(data);
      page++;
    }
    return items;
  }

  const fetchFollowing = await fetchAllPages('https://api.github.com/users/maugus0/following');
  const fetchFollowers = await fetchAllPages('https://api.github.com/users/maugus0/followers');

  console.log('Total Following:', fetchFollowing.length);
  console.log('Total Followers:', fetchFollowers.length);

  const followerUsernames = new Set(fetchFollowers.map(user => user.login));
  const followingUsernames = fetchFollowing.map(user => user.login);
  const notFollowingBack = followingUsernames.filter(user => !followerUsernames.has(user));

  if (notFollowingBack.length > 0) {
    console.log(`\n⚠️ ${notFollowingBack.length} user(s) haven't followed you back:`);
    notFollowingBack.forEach(user => console.log(`   - ${user}`));
  } else {
    console.log('\n✅ Everyone you follow has followed you back!');
  }
}

checkFollowBack();

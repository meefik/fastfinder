import Login from 'views/Login.svelte';
import Search from 'views/Search.svelte';
import Users from 'views/Users.svelte';
import Logs from 'views/Logs.svelte';
import About from 'views/About.svelte';
import NotFound from 'views/NotFound.svelte';

export default {
  '/search': Search,
  '/users': Users,
  '/logs': Logs,
  '/about': About,
  '/login': Login,
  '*': NotFound
};

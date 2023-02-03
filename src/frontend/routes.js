import Home from 'views/Home.svelte';
import About from 'views/About.svelte';
import Login from 'views/Login.svelte';
import NotFound from 'views/NotFound.svelte';

export default {
  '/': Home,
  '/about': About,
  '/login': Login,
  '*': NotFound
};

<script>
  import Router from "svelte-spa-router";
  import routes from "routes";
  import session from "stores/session";

  import {
    Header,
    HeaderNav,
    HeaderNavItem,
    HeaderUtilities,
    HeaderGlobalAction,
    Content,
    Loading,
  } from "carbon-components-svelte";
  import Logout from "carbon-icons-svelte/lib/Logout.svelte";

  let logged;
  session.subscribe((value) => {
    logged = value;
    if (typeof value !== "undefined") {
      if (!value) location.href = "#/login";
      else if (location.hash === "#/login") {
        if (value.user?.role === "admin") location.href = "#/users";
        else location.href = "#/search";
      }
    }
  });

  window.addEventListener(
    "hashchange",
    () => {
      if (!logged) location.href = "#/login";
    },
    false
  );

  function logoutHandler() {
    session.set(null);
  }
</script>

<Header company="FastFinder" platformName="Auto parts search engine">
  {#if logged?.user}
    <HeaderNav>
      {#if logged.user.role === "admin"}
        <HeaderNavItem href="#/users" text="Users" />
        <HeaderNavItem href="#/logs" text="Logs" />
      {:else}
        <HeaderNavItem href="#/search" text="Search" />
      {/if}
      <HeaderNavItem href="#/about" text="About" />
    </HeaderNav>
    <HeaderUtilities>
      <HeaderNav>
        <HeaderNavItem text={logged.user?.username} />
      </HeaderNav>
      <HeaderGlobalAction icon={Logout} on:click={logoutHandler} />
    </HeaderUtilities>
  {/if}
</Header>
{#if typeof logged === "undefined"}
  <Loading />
{:else}
  <Content>
    <Router {routes} />
  </Content>
{/if}

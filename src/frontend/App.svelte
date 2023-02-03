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
      <HeaderNavItem href="#/" text="Home" />
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

<script>
  import {
    Form,
    TextInput,
    PasswordInput,
    Button,
    InlineNotification,
    Grid,
    Row,
    Column,
  } from "carbon-components-svelte";
  import { logIn } from "stores/session";

  let error = "";
  let password = "";
  let username = "";

  $: disabled = !username || !password;

  /**
   * Form event handler.
   * @param {SubmitEvent} e
   * @this {HTMLFormElement}
   */
  async function formHandler(e) {
    e.preventDefault();
    error = "";
    const formData = new FormData(this);
    try {
      await logIn(Object.fromEntries(formData));
    } catch (err) {
      error = err.message;
    }
  }
</script>

<Grid>
  <Row>
    <Column sm={{ span: 2, offset: 1 }}>
      {#if error}
        <InlineNotification title="Error:" subtitle={error} />
      {/if}
    </Column>
  </Row>
  <Row>
    <Column sm={{ span: 2, offset: 1 }}>
      <Form on:submit={formHandler}>
        <TextInput
          bind:value={username}
          name="username"
          labelText="User name"
          placeholder="Enter user name..."
        />
        <PasswordInput
          bind:value={password}
          type="password"
          name="password"
          labelText="Password"
          placeholder="Enter password..."
        />
        <Button type="submit" {disabled}>Log In</Button>
      </Form>
    </Column>
  </Row>
</Grid>

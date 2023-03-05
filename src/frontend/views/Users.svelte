<script>
  import {
    DataTable,
    Toolbar,
    ToolbarContent,
    ToolbarSearch,
    Pagination,
    Grid,
    Row,
    Column,
    Button,
    Modal,
    TextInput,
    Select,
    SelectItem,
  } from "carbon-components-svelte";
  import Add from "carbon-icons-svelte/lib/Add.svelte";
  import Edit from "carbon-icons-svelte/lib/Edit.svelte";
  import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";
  import {
    getUsersList,
    createUser,
    updateUser,
    deleteUser,
  } from "stores/users";

  let filteredRowIds = [];
  let selectedRowIds = [];
  let pageSize = 20;
  let page = 1;
  let totalItems = 0;
  let rows = [];
  let createUserDialog = false;
  let deleteUserDialog = false;
  let updateUserDialog = false;
  let user = {};

  async function syncUsersList() {
    const { data, total } = await getUsersList(pageSize, (page - 1) * pageSize);
    rows = data || [];
    totalItems = total || 0;
  }

  $: syncUsersList(page);
</script>

<!-- Create User Dialog -->
<Modal
  bind:open={createUserDialog}
  modalHeading="Create a new user"
  primaryButtonText="Create"
  secondaryButtonText="Cancel"
  on:click:button--secondary={() => (createUserDialog = false)}
  on:click:button--primary={async () => {
    if (user.username && user.password) {
      await createUser(user);
      syncUsersList();
      createUserDialog = false;
    }
  }}
  on:open
  on:close
  on:submit
>
  <Select
    labelText="Role"
    bind:selected={user.role}
    on:change={(e) => (user.role = e.target.value)}
  >
    <SelectItem value="user" text="User" />
    <SelectItem value="admin" text="Admin" />
  </Select>
  <TextInput
    bind:value={user.username}
    labelText="Username"
    placeholder="Enter a user login..."
  />
  <TextInput
    bind:value={user.password}
    type="password"
    labelText="Password"
    placeholder="Enter a user password..."
  />
</Modal>

<!-- Update User Dialog -->
<Modal
  bind:open={updateUserDialog}
  modalHeading="Update the user"
  primaryButtonText="Update"
  secondaryButtonText="Cancel"
  on:click:button--secondary={() => (updateUserDialog = false)}
  on:click:button--primary={async () => {
    if (user.id) {
      await updateUser(user.id, user);
      syncUsersList();
      user.password = "";
      delete user.password;
      updateUserDialog = false;
    }
  }}
  on:open
  on:close
  on:submit
>
  <Select
    labelText="Role"
    bind:selected={user.role}
    on:change={(e) => (user.role = e.target.value)}
  >
    <SelectItem value="user" text="User" />
    <SelectItem value="admin" text="Admin" />
  </Select>
  <TextInput
    bind:value={user.username}
    labelText="Username"
    placeholder="Enter a user login..."
  />
  <TextInput
    bind:value={user.password}
    type="password"
    labelText="Password"
    placeholder="Enter a user password..."
  />
</Modal>

<!-- Delete User Dialog -->
<Modal
  danger
  bind:open={deleteUserDialog}
  modalHeading="Delete selected user"
  primaryButtonText="Delete"
  secondaryButtonText="Cancel"
  on:click:button--secondary={() => (deleteUserDialog = false)}
  on:click:button--primary={async () => {
    if (user.id) {
      await deleteUser(user.id);
      syncUsersList();
      deleteUserDialog = false;
    }
  }}
  on:open
  on:close
  on:submit
>
  <p>This is a permanent action and cannot be undone.</p>
</Modal>

<!-- Table -->
<Grid>
  <Row>
    <Column>
      <DataTable
        title="Users"
        sortable
        radio
        bind:selectedRowIds
        headers={[
          { key: "username", value: "Username" },
          { key: "role", value: "Role" },
          { key: "loggedAt", value: "Logged At" },
          { key: "ipaddress", value: "IP address" },
          { key: "useragent", value: "User-Agent" },
        ]}
        {rows}
        on:click:row--select={(e) => {
          user = e.detail.row;
        }}
      >
        <Toolbar>
          <ToolbarContent>
            <ToolbarSearch
              persistent
              value=""
              shouldFilterRows
              bind:filteredRowIds
            />
            <Button
              kind="ghost"
              iconDescription="Create"
              icon={Add}
              on:click={() => {
                selectedRowIds = [];
                user = {};
                createUserDialog = true;
              }}
            />
            <Button
              kind="ghost"
              iconDescription="Edit"
              icon={Edit}
              on:click={() => {
                if (selectedRowIds.length) {
                  updateUserDialog = true;
                }
              }}
            />
            <Button
              kind="danger-ghost"
              iconDescription="Delete"
              icon={TrashCan}
              on:click={() => {
                if (selectedRowIds.length) {
                  deleteUserDialog = true;
                }
              }}
            />
          </ToolbarContent>
        </Toolbar>
        <svelte:fragment slot="cell" let:row let:cell>
          {#if typeof cell.value === "undefined"}
            &#8212;
          {:else}
            {cell.value}
          {/if}
        </svelte:fragment>
      </DataTable>

      <Pagination
        bind:pageSize
        bind:page
        bind:totalItems
        pageInputDisabled
        pageSizeInputDisabled
      />
    </Column>
  </Row>
</Grid>

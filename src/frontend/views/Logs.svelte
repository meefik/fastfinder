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
  } from "carbon-components-svelte";
  import DocumentDownload from "carbon-icons-svelte/lib/DocumentDownload.svelte";
  import { getLogsList, downloadLogsAsCSV } from "stores/logs";

  let filteredRowIds = [];
  let pageSize = 20;
  let page = 1;
  let totalItems = 0;
  let rows = [];

  async function syncLogsList() {
    const { data, total } = await getLogsList(pageSize, (page - 1) * pageSize);
    rows = data || [];
    totalItems = total || 0;
  }

  $: syncLogsList(page);
</script>

<!-- Table -->
<Grid>
  <Row>
    <Column>
      <DataTable
        title="Users"
        sortable
        headers={[
          { key: "user.username", value: "Username" },
          { key: "createdAt", value: "Timestamp" },
          { key: "ip", value: "IP address" },
          { key: "useragent", value: "User-Agent" },
          { key: "method", value: "Method" },
          { key: "url", value: "URL" },
          { key: "statusCode", value: "Code" },
          { key: "statusMessage", value: "Message" },
          { key: "duration", value: "Duration" },
          { key: "size", value: "Size" },
        ]}
        {rows}
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
              iconDescription="Download CSV"
              icon={DocumentDownload}
              on:click={() => {
                downloadLogsAsCSV([
                  "createdAt",
                  "user.username",
                  "ip",
                  "useragent",
                  "method",
                  "url",
                  "statusCode",
                  "statusMessage",
                  "duration",
                  "size",
                ]);
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

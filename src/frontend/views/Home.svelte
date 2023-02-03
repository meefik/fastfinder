<script>
  import {
    DataTable,
    Toolbar,
    ToolbarContent,
    ToolbarSearch,
    Pagination,
    Grid,
    Row,
    Form,
    FormGroup,
    Column,
    TextInput,
    Button,
    Link,
    DataTableSkeleton,
  } from "carbon-components-svelte";
  import Launch from "carbon-icons-svelte/lib/Launch.svelte";
  import { searchProducts } from "stores/search";

  let rows = [];
  let pageSize = 10;
  let page = 1;
  let filteredRowIds = [];
  let loading = false;

  /**
   * Form event handler.
   * @param {SubmitEvent} e
   * @this {HTMLFormElement}
   */
  async function formHandler(e) {
    e.preventDefault();
    loading = true;
    const formData = new FormData(this);
    const params = Object.fromEntries(formData);
    if (params.vin && params.zip && params.partNumber) {
      try {
        rows = (await searchProducts(params)) || [];
      } catch (err) {
        console.error(err);
      }
    }
    loading = false;
  }
</script>

<Grid>
  <Row>
    <Column max={4}>
      <Form on:submit={formHandler}>
        <FormGroup legendText="Vehicle">
          <TextInput name="vin" placeholder="VIN" />
        </FormGroup>
        <FormGroup legendText="Location">
          <TextInput name="zip" placeholder="ZIP" />
        </FormGroup>
        <FormGroup legendText="Search">
          <TextInput name="partNumber" placeholder="Part Number" />
        </FormGroup>
        <FormGroup>
          <Button type="submit" bind:disabled={loading}>Submit</Button>
        </FormGroup>
      </Form>
    </Column>
    <Column max={12}>
      {#if loading}
        <DataTableSkeleton
          headers={[
            "Image",
            "Title",
            "Part Number",
            "Seller",
            "Price",
            "Location",
            "Fits",
            "Link",
          ]}
          rows={pageSize}
        />
      {:else}
        <DataTable
          title="Auto parts"
          description="List of found auto parts."
          sortable
          headers={[
            { key: "image", value: "Image", sort: false },
            { key: "title", value: "Title" },
            { key: "partNumber", value: "Part Number" },
            { key: "seller", value: "Seller" },
            { key: "price", value: "Price" },
            { key: "location", value: "Location" },
            { key: "fits", value: "Fits" },
            { key: "link", value: "Link", sort: false },
          ]}
          {rows}
          {pageSize}
          {page}
        >
          <Toolbar>
            <ToolbarContent>
              <ToolbarSearch
                persistent
                value=""
                shouldFilterRows
                bind:filteredRowIds
              />
            </ToolbarContent>
          </Toolbar>
          <svelte:fragment slot="cell" let:row let:cell>
            {#if cell.key === "link" && cell.value}
              <Link
                icon={Launch}
                href={cell.value}
                target="_blank"
                rel="noopener noreferrer"
              />
            {:else if cell.key === "image" && cell.value}
              <img src={cell.value} class="product-image" alt="" />
            {:else if cell.key === "fits"}
              {cell.value ? "Yes" : "No"}
            {:else}
              {cell.value}
            {/if}
          </svelte:fragment>
        </DataTable>

        <Pagination
          bind:pageSize
          bind:page
          totalItems={filteredRowIds.length}
          pageSizeInputDisabled
        />
      {/if}
    </Column>
  </Row>
</Grid>

<style>
  .product-image {
    width: 80px;
    max-height: 80px;
  }
</style>

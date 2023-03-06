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
    ComboBox,
    Button,
    Link,
    DataTableSkeleton,
    Checkbox,
  } from "carbon-components-svelte";
  import Launch from "carbon-icons-svelte/lib/Launch.svelte";
  import {
    getYears,
    getMakes,
    getModels,
    getEngines,
    getCategories,
    getGroups,
    getPartNumbers,
  } from "stores/catalog";
  import { searchProducts } from "stores/search";

  let rows = [];
  let pageSize = 10;
  let page = 1;
  let filteredRowIds = [];
  let loading = false;
  let time;
  let sellers = [
    { id: "autozone", text: "autozone.com" },
    { id: "oreillyauto", text: "oreillyauto.com" },
    { id: "advanceautoparts", text: "advanceautoparts.com" },
  ];
  let selectedSellers = ["autozone", "oreillyauto", "advanceautoparts"];
  let years = [];
  let makes = [];
  let models = [];
  let engines = [];
  let categories = [];
  let groups = [];
  let partnumbers = [];
  let sessionId, vin, year, make, model, engine, category, group;

  let zip = localStorage.getItem("location-zip") || "";
  $: localStorage.setItem("location-zip", zip);

  async function runAsyncTask() {
    const { sid, list } = await getYears();
    sessionId = sid;
    years = list.map((v) => ({ id: v, text: v }));
  }

  runAsyncTask();

  /**
   * Form event handler.
   * @param {SubmitEvent} e
   * @this {HTMLFormElement}
   */
  function formHandler(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const params = Object.fromEntries(formData);
    if (params.zip && params.partNumbers) {
      loading = true;
      time = null;
      const _rows = [];
      const getProductsBySeller = async (seller) => {
        try {
          const items =
            (await searchProducts(seller, {
              zip: params.zip,
              partNumbers: `${params.partNumbers}`.split(/\s*,\s*/),
            })) || [];
          _rows.push(...items);
        } catch (err) {
          console.error(err);
        }
      };
      const now = Date.now();
      Promise.all(
        selectedSellers.map((seller) =>
          getProductsBySeller(seller).catch(console.error)
        )
      ).finally(() => {
        rows = _rows.map((item, index) => {
          item.id = index + 1;
          return item;
        });
        time = ~~((Date.now() - now) / 1000);
        loading = false;
      });
    }
  }

  function shouldFilterItem(item, value) {
    if (!value) return true;
    return item.text.toLowerCase().includes(value.toLowerCase());
  }

  async function doYearSelect(e) {
    const { selectedId } = e.detail;
    const { list } = await getMakes({ sid: sessionId, year: selectedId });
    makes = list.map((v) => ({ id: v, text: v }));
  }

  async function doMakeSelect(e) {
    const { selectedId } = e.detail;
    const { list } = await getModels({
      sid: sessionId,
      year,
      make: selectedId,
    });
    models = list.map((v) => ({ id: v, text: v }));
  }

  async function doModelSelect(e) {
    const { selectedId } = e.detail;
    const { list } = await getEngines({
      sid: sessionId,
      year,
      make,
      model: selectedId,
    });
    engines = list.map((v) => ({ id: v, text: v }));
  }

  async function doEngineSelect(e) {
    const { selectedId } = e.detail;
    const { list } = await getCategories({
      sid: sessionId,
      year,
      make,
      model,
      engine: selectedId,
    });
    categories = list.map((v) => ({ id: v, text: v }));
  }

  async function doVinChange(e) {
    const vin = e.detail;
    const { list } = await getCategories({
      sid: sessionId,
      vin,
    });
    categories = list.map((v) => ({ id: v, text: v }));
  }

  async function doCategorySelect(e) {
    const { selectedId } = e.detail;
    const { list } = await getGroups({
      sid: sessionId,
      category: selectedId,
    });
    groups = list.map((v) => ({ id: v, text: v }));
  }

  async function doGroupSelect(e) {
    const { selectedId } = e.detail;
    const { list } = await getPartNumbers({
      sid: sessionId,
      category,
      group: selectedId,
    });
    partnumbers = list;
  }
</script>

<Grid>
  <Row>
    <Column max={4}>
      <Form on:submit={formHandler}>
        <FormGroup legendText="Sellers">
          {#each sellers as seller}
            <Checkbox
              bind:group={selectedSellers}
              labelText={seller.text}
              value={seller.id}
            />
          {/each}
        </FormGroup>
        <FormGroup legendText="Location">
          <TextInput name="zip" placeholder="ZIP" bind:value={zip} />
        </FormGroup>
        <FormGroup legendText="Vehicle">
          <ComboBox
            disabled={!years.length}
            name="year"
            placeholder="Year"
            bind:value={year}
            bind:items={years}
            on:select={doYearSelect}
            {shouldFilterItem}
          />
          <ComboBox
            disabled={!makes.length}
            name="make"
            placeholder="Make"
            bind:value={make}
            bind:items={makes}
            on:select={doMakeSelect}
            {shouldFilterItem}
          />
          <ComboBox
            disabled={!models.length}
            name="model"
            placeholder="Model"
            bind:value={model}
            bind:items={models}
            on:select={doModelSelect}
            {shouldFilterItem}
          />
          <ComboBox
            disabled={!engines.length}
            name="engine"
            placeholder="Engine"
            bind:value={engine}
            bind:items={engines}
            on:select={doEngineSelect}
            {shouldFilterItem}
          />
          <TextInput
            name="vin"
            labelText=" "
            placeholder="VIN"
            bind:value={vin}
            on:change={doVinChange}
          />
        </FormGroup>
        <FormGroup legendText="Search">
          <ComboBox
            disabled={!categories.length}
            name="category"
            placeholder="Category"
            bind:value={category}
            bind:items={categories}
            on:select={doCategorySelect}
            {shouldFilterItem}
          />
          <ComboBox
            disabled={!groups.length}
            name="group"
            placeholder="Group"
            bind:value={group}
            bind:items={groups}
            on:select={doGroupSelect}
            {shouldFilterItem}
          />
          <TextInput
            name="partNumbers"
            labelText=" "
            placeholder="Part Numbers"
            bind:value={partnumbers}
          />
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
            "Availability",
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
            { key: "availability", value: "Availability" },
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
            {:else if cell.key === "availability"}
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
          pageInputDisabled
          pageSizeInputDisabled
        />
      {/if}
      {#if time}
        <div style="text-align:right;font-size:0.8em;">
          Generated in {time} sec.
        </div>
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

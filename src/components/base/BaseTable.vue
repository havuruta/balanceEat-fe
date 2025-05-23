<template>
  <table class="base-table">
    <thead>
      <tr>
        <th v-for="(col, i) in columns" :key="i">{{ col.label }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, i) in rows" :key="i">
        <td v-for="(col, j) in columns" :key="j">
          <slot :name="col.key" :row="row">{{ row[col.key] }}</slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
const props = defineProps({
  columns: Array, // [{ key: 'name', label: '이름' }, ...]
  rows: Array,
})
</script>

<style scoped>
.base-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}
.base-table th,
.base-table td {
  padding: 0.9rem 0.7rem;
  border-bottom: 1px solid #e0e0e0;
  text-align: left;
}
.base-table th {
  background: #f5f5f5;
  font-weight: 600;
}
</style>

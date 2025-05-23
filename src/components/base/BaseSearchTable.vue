<template>
  <div class="search-table-wrapper">
    <div class="search-bar">
      <select v-model="searchColumn">
        <option v-for="opt in searchOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <input v-model="searchKeyword" :placeholder="searchPlaceholder" @keyup.enter="onSearch" />
      <button class="search-btn" @click="onSearch">검색</button>
    </div>
    <table class="base-table">
      <thead>
        <tr>
          <th v-for="(col, i) in columns" :key="i">{{ col.label }}</th>
          <th v-if="selectable"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in pagedRows" :key="row.id || i">
          <td v-for="(col, j) in columns" :key="j">{{ row[col.key] }}</td>
          <td v-if="selectable">
            <button class="select-btn" @click="$emit('select', row.id)">선택</button>
          </td>
        </tr>
        <tr v-if="pagedRows.length === 0">
          <td :colspan="columns.length + (selectable ? 1 : 0)" class="no-data">
            검색 결과가 없습니다.
          </td>
        </tr>
      </tbody>
    </table>
    <div class="pagination-bar">
      <button :disabled="page === 1" @click="$emit('pageChange', page - 1)">&lt;</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page === totalPages" @click="$emit('pageChange', page + 1)">&gt;</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
const props = defineProps({
  columns: Array, // [{ key, label }]
  rows: Array, // [{ ... }]
  searchOptions: Array, // [{ value, label }]
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  total: { type: Number, default: 0 },
  selectable: { type: Boolean, default: true },
})
const emit = defineEmits(['select', 'pageChange', 'search'])
const searchColumn = ref(props.searchOptions[0]?.value || '')
const searchKeyword = ref('')
const searchPlaceholder = computed(() => {
  const opt = props.searchOptions.find((o) => o.value === searchColumn.value)
  return opt ? `${opt.label}을(를) 입력하세요.` : '검색어를 입력하세요.'
})

function onSearch() {
  emit('search', { column: searchColumn.value, keyword: searchKeyword.value })
}

const pagedRows = computed(() => {
  // 실제 데이터 페이징은 부모에서 처리하는 것이 일반적이나, 예시로 slice 처리
  const start = (props.page - 1) * props.pageSize
  return props.rows.slice(start, start + props.pageSize)
})
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

watch(
  () => props.page,
  (v) => {
    // 페이지 변경 시 스크롤 등 추가 동작 가능
  },
)
</script>

<style scoped>
.search-table-wrapper {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  margin: 0 auto;
  max-width: 1100px;
}
.search-bar {
  display: flex;
  gap: 0.7rem;
  margin-bottom: 1.2rem;
  align-items: center;
}
.search-bar select,
.search-bar input {
  padding: 0.6rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
}
.search-bar input {
  flex: 1;
}
.search-btn {
  background: #22a366;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.3rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.search-btn:hover {
  background: #1e8c5a;
}
.base-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  margin-bottom: 1.2rem;
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
.select-btn {
  background: #22a366;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 1.1rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.select-btn:hover {
  background: #1e8c5a;
}
.no-data {
  text-align: center;
  color: #aaa;
  font-size: 1.1rem;
  padding: 2rem 0;
}
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  margin-top: 0.5rem;
}
.pagination-bar button {
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  color: #333;
}
.pagination-bar button:disabled {
  background: #eee;
  color: #bbb;
  cursor: not-allowed;
}
</style>

<template>
  <div class="search-table-wrapper" :class="{ 'modal-version': isModal }">
    <div class="search-bar">
      <select v-model="searchColumn">
        <option v-for="opt in searchOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <select v-if="searchColumn === 'category'" v-model="searchKeyword" class="category-select">
        <option value="">음식 분류를 선택하세요</option>
        <option v-for="category in foodCategories" :key="category.value" :value="category.value">
          {{ category.label }}
        </option>
      </select>
      <input v-else v-model="searchKeyword" :placeholder="searchPlaceholder" @keyup.enter="onSearch" />
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
          <td v-for="(col, j) in columns" :key="j">
            <template v-if="col.key === 'category'">
              {{ FoodCategoryLabels[row[col.key]] || row[col.key] }}
            </template>
            <template v-else>
              {{ row[col.key] }}
            </template>
          </td>
          <td v-if="selectable">
            <button class="select-btn" @click="$emit('select', row)">선택</button>
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
      <button :disabled="page === 0" @click="handlePageChange(0)"><<</button>
      <button :disabled="page === 0" @click="handlePageChange(Math.max(0, page - 10))"><</button>
      <button :disabled="page === 0" @click="handlePageChange(page - 1)">이전</button>
      <span>{{ displayPage }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages - 1" @click="handlePageChange(page + 1)">다음</button>
      <button :disabled="page >= totalPages - 1" @click="handlePageChange(Math.min(totalPages - 1, page + 10))">></button>
      <button :disabled="page >= totalPages - 1" @click="handlePageChange(totalPages - 1)">>></button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { FoodCategoryLabels } from '@/constants/FoodCategory'

const props = defineProps({
  columns: Array, // [{ key, label }]
  rows: Array, // [{ ... }]
  searchOptions: Array, // [{ value, label }]
  searchState: { type: Object, default: () => ({ column: '', keyword: '' }) },
  page: { type: Number, default: 0 },
  pageSize: { type: Number, default: 10 },
  totalElements: { type: Number, default: 0 },
  selectable: { type: Boolean, default: true },
  foodCategories: { type: Array, default: () => [] },
  isModal: { type: Boolean, default: false }
})
const emit = defineEmits(['select', 'pageChange', 'search'])
const searchColumn = ref(props.searchOptions[0]?.value || '')
const searchKeyword = ref('')

// searchState 변경 감시
watch(
  () => props.searchState,
  (newState) => {
    if (newState) {
      searchColumn.value = newState.column
      searchKeyword.value = newState.keyword
    }
  },
  { immediate: true }
)

const searchPlaceholder = computed(() => {
  const opt = props.searchOptions.find((o) => o.value === searchColumn.value)
  return opt ? `${opt.label}을(를) 입력하세요.` : '검색어를 입력하세요.'
})

function onSearch() {
  // 음식 분류 검색 시 빈 값이면 검색하지 않음
  if (searchColumn.value === 'category' && !searchKeyword.value) {
    return
  }
  emit('search', { column: searchColumn.value, keyword: searchKeyword.value })
}

// 음식 분류 선택 시 자동 검색 방지
watch(searchKeyword, (newValue) => {
  if (searchColumn.value === 'category' && !newValue) {
    return
  }
})

// 검색 옵션(컬럼)이 바뀌면 검색어도 초기화
watch(searchColumn, (newVal, oldVal) => {
  searchKeyword.value = ''
})

const pagedRows = computed(() => {
  return props.rows
})

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalElements / props.pageSize)))

// 표시용 페이지 번호 (1부터 시작)
const displayPage = computed(() => props.page + 1)

function getCategoryLabel(category) {
  return FoodCategoryLabels[category] || category
}

// 페이지 변경 처리 함수
function handlePageChange(newPage) {
  if (newPage >= 0 && newPage < totalPages.value) {
    emit('pageChange', newPage)
  }
}

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

/* 모달 버전 스타일 */
.search-table-wrapper.modal-version {
  max-width: 700px;
  padding: 1rem;
}

.search-table-wrapper.modal-version .search-bar {
  margin-bottom: 4rem;
  gap: 0.3rem;
}

.search-table-wrapper.modal-version .search-bar select,
.search-table-wrapper.modal-version .search-bar input {
  padding: 0.3rem 0.5rem;
  font-size: 0.85rem;
  height: 32px;
}

.search-table-wrapper.modal-version .search-btn {
  padding: 0.3rem 0.8rem;
  font-size: 0.85rem;
  height: 32px;
}

.search-table-wrapper.modal-version .base-table {
  margin-bottom: 0.5rem;
  min-height: 300px;
}

.search-table-wrapper.modal-version .base-table th,
.search-table-wrapper.modal-version .base-table td {
  padding: 0.4rem 0.3rem;
  font-size: 0.85rem;
}

.search-table-wrapper.modal-version .select-btn {
  padding: 0.2rem 0.6rem;
  font-size: 0.85rem;
}

.search-table-wrapper.modal-version .pagination-bar {
  margin-top: 0.3rem;
  gap: 0.3rem;
}

.search-table-wrapper.modal-version .pagination-bar button {
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;
  min-width: 32px;
}

.search-table-wrapper.modal-version .pagination-bar span {
  font-size: 0.8rem;
  margin: 0 0.3rem;
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
  height: 40px;
  box-sizing: border-box;
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
  table-layout: fixed;
  min-height: 400px;
}
.base-table th,
.base-table td {
  padding: 0.8rem 0.5rem;
  border-bottom: 1px solid #e0e0e0;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.base-table th:nth-child(1),
.base-table td:nth-child(1) {
  width: 25%; /* 음식명 */
}
.base-table th:nth-child(2),
.base-table td:nth-child(2),
.base-table th:nth-child(3),
.base-table td:nth-child(3),
.base-table th:nth-child(4),
.base-table td:nth-child(4),
.base-table th:nth-child(5),
.base-table td:nth-child(5) {
  width: 12%; /* 칼로리, 단백질, 지방, 탄수화물 */
}
.base-table th:nth-child(6),
.base-table td:nth-child(6) {
  width: 15%; /* 음식 분류 */
}
.base-table th:last-child,
.base-table td:last-child {
  width: 10%; /* 선택 버튼 */
}

/* 모달 버전 열 너비 */
.search-table-wrapper.modal-version .base-table th:nth-child(1),
.search-table-wrapper.modal-version .base-table td:nth-child(1) {
  width: 30%; /* 음식명 */
}

.search-table-wrapper.modal-version .base-table th:nth-child(2),
.search-table-wrapper.modal-version .base-table td:nth-child(2),
.search-table-wrapper.modal-version .base-table th:nth-child(3),
.search-table-wrapper.modal-version .base-table td:nth-child(3),
.search-table-wrapper.modal-version .base-table th:nth-child(4),
.search-table-wrapper.modal-version .base-table td:nth-child(4),
.search-table-wrapper.modal-version .base-table th:nth-child(5),
.search-table-wrapper.modal-version .base-table td:nth-child(5) {
  width: 10%; /* 칼로리, 단백질, 지방, 탄수화물 */
}

.search-table-wrapper.modal-version .base-table th:nth-child(6),
.search-table-wrapper.modal-version .base-table td:nth-child(6) {
  width: 20%; /* 음식 분류 */
}

.search-table-wrapper.modal-version .base-table th:last-child,
.search-table-wrapper.modal-version .base-table td:last-child {
  width: 10%; /* 선택 버튼 */
}

.base-table th {
  background: #f5f5f5;
  font-weight: 600;
  font-size: 0.98rem;
  position: sticky;
  top: 0;
  z-index: 1;
}
.base-table td {
  font-size: 0.97rem;
}
.base-table td:hover {
  white-space: normal;
  word-break: break-word;
  position: relative;
  z-index: 2;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.pagination-bar button {
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 0.8rem;
  font-size: 0.9rem;
  cursor: pointer;
  color: #333;
  min-width: 40px;
}
.pagination-bar button:disabled {
  background: #eee;
  color: #bbb;
  cursor: not-allowed;
}
.pagination-bar span {
  margin: 0 0.5rem;
  font-size: 0.9rem;
  color: #666;
}
.category-select {
  flex: 1;
  padding: 0.6rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  background-color: white;
  height: 40px;
  box-sizing: border-box;
}
.base-table tbody {
  min-height: 400px;
}
.base-table tr {
  height: 40px;
}
</style>

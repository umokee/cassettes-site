import { ref, reactive, computed, watch } from 'vue';

export function useModal(options = {}) {
  const {
    createFn,
    updateFn,
    validateFn,
    transformData = (data) => data,
    defaultForm = {},
    successMessages = {
      create: 'Запись создана',
      update: 'Запись обновлена'
    }
  } = options;

  const form = reactive({ ...defaultForm });
  const errors = reactive({});
  const loading = ref(false);

  const resetForm = () => {
    Object.keys(form).forEach(key => {
      form[key] = defaultForm[key];
    });
    Object.keys(errors).forEach(key => delete errors[key]);
  };

  const populateForm = (data) => {
    Object.keys(form).forEach(key => {
      if (data && data[key] !== undefined) {
        form[key] = data[key];
      } else {
        form[key] = defaultForm[key];
      }
    });
  };

  const validate = () => {
    Object.keys(errors).forEach(key => delete errors[key]);

    if (validateFn) {
      const validationErrors = validateFn(form);
      Object.assign(errors, validationErrors);
      return Object.values(errors).every(e => e === null || e === '' || e === undefined);
    }

    return true;
  };

  const submit = async (isEdit, itemId) => {
    if (!validate()) {
      return { success: false, error: 'Validation failed' };
    }

    loading.value = true;
    try {
      const submitData = transformData({ ...form });

      let result;
      if (isEdit && updateFn) {
        result = await updateFn(itemId, submitData);
      } else if (createFn) {
        result = await createFn(submitData);
      }

      resetForm();
      return {
        success: true,
        data: result,
        message: isEdit ? successMessages.update : successMessages.create
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Ошибка сохранения'
      };
    } finally {
      loading.value = false;
    }
  };

  return {
    form,
    errors,
    loading,
    resetForm,
    populateForm,
    validate,
    submit
  };
}

export function useModalState() {
  const isOpen = ref(false);
  const selectedItem = ref(null);

  const open = (item = null) => {
    selectedItem.value = item;
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
    selectedItem.value = null;
  };

  const isEdit = computed(() => !!selectedItem.value);

  return {
    isOpen,
    selectedItem,
    isEdit,
    open,
    close
  };
}

<template>
    <div
        v-if="!file"
        class="upload-container"
        :class="{ 'is-dragover': isDragOver }"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
    >
        <div class="icon-wrapper">
            <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                <polyline points="7 9 12 4 17 9" />
                <line x1="12" y1="4" x2="12" y2="16" />
            </svg>
        </div>
        <div class="upload-text">Drag and drop file here</div>
        <span>or</span>
        <v-btn @click="browseFile">Browse file</v-btn>

        <input
            ref="fileInput"
            type="file"
            accept=".txt,.pdf,.doc,.docx,.ppt,.pptx"
            class="input-file"
            @change="handleFileSelect"
            hidden
        />
    </div>

    <div v-else class="file-info">
        <div>{{ file?.name }}</div>
        <v-btn @click="removeFile">Remove</v-btn>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue'

    const props = defineProps<{
        modelValue: File | null
    }>()

    const emit = defineEmits<{
        (e: 'update:modelValue', value: File | null): void
    }>()

    const allowedExtensions = ['txt', 'pdf', 'doc', 'docx', 'ppt', 'pptx']
    const fileInput = ref<HTMLInputElement | null>(null)
    const isDragOver = ref(false)

    const file = computed({
        get: () => props.modelValue,
        set: (val: File | null) => {
            emit('update:modelValue', val)
        },
    })

    function isFileTypeAllowed(file: File): boolean {
        const ext = file.name.split('.').pop()?.toLowerCase()
        return ext ? allowedExtensions.includes(ext) : false
    }

    function browseFile() {
        fileInput.value?.click()
    }

    function removeFile() {
        file.value = null
        if (fileInput.value) {
            fileInput.value.value = ''
        }
    }

    function handleFileSelect(event: Event) {
        const target = event.target as HTMLInputElement
        const files = target.files
        if (!files || !files.length) return

        const validFiles = Array.from(files).filter(isFileTypeAllowed)
        file.value = validFiles.length > 0 ? validFiles[0] : null

        if (!file.value) {
            console.warn('No valid file was selected')
        }
    }

    function handleDragOver() {
        isDragOver.value = true
    }

    function handleDragLeave() {
        isDragOver.value = false
    }

    function handleDrop(event: DragEvent) {
        isDragOver.value = false
        const files = event.dataTransfer?.files
        if (!files || !files.length) return

        const validFiles = Array.from(files).filter(isFileTypeAllowed)
        file.value = validFiles.length > 0 ? validFiles[0] : null

        if (!file.value) {
            console.warn('No valid file was dropped')
        }
    }
</script>

<style scoped>
    .upload-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 2px dashed #ccc;
        border-radius: 6px;
        padding: 2rem;
        text-align: center;
        cursor: pointer;
        transition: border-color 0.3s ease;
    }

    .upload-container.is-dragover {
        border-color: #4285f4;
    }

    .icon-wrapper {
        margin-bottom: 1rem;
        color: #999;
    }

    .upload-text {
        margin: 1rem 0 0.5rem;
        font-size: 1.1rem;
    }

    button {
        margin-top: 0.5rem;
        padding: 0.5rem 1rem;
        cursor: pointer;
    }

    .file-info {
        margin-top: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: #333;
        word-wrap: break-word;
        overflow-wrap: break-word;
        white-space: normal;
        word-break: break-all;
    }

    .file-info span {
        word-wrap: break-word;
        white-space: normal;
    }

    .file-info > :first-child {
        flex-grow: 1;
    }

    .file-info > :last-child {
        flex-grow: 0;
        min-width: 50px;
    }

    .input-file {
        display: none;
    }
</style>

// script.js

// Список доступных для скачивания JAR-файлов.
// Пути указываются относительно корня сайта.
const filePaths = [
    'jar-files/appleskin-fabric-mc1.21.6-3.0.6.jar',
    'jar-files/chatanimation-1.0.7.jar',
    'jar-files/emotecraft-fabric-for-MC1.21.7-3.0.0-b.build.123.jar',
    'jar-files/emotecraft-recording-addon-1.2.0.jar',
    'jar-files/sodium-fabric-0.7.2+mc1.21.8.jar'
];

const fileListDiv = document.querySelector('.file-list');
const downloadBtn = document.getElementById('downloadBtn');

// Динамически создаем чекбоксы для каждого файла
filePaths.forEach(filePath => {
    const fileName = filePath.split('/').pop();
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" name="file" value="${filePath}" checked> ${fileName}`;
    fileListDiv.appendChild(label);
});

// Обработка клика по кнопке
downloadBtn.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('input[name="file"]:checked');
    const selectedFiles = Array.from(checkboxes).map(cb => cb.value);

    if (selectedFiles.length === 0) {
        alert('Пожалуйста, выберите хотя бы один файл.');
        return;
    }

    const zip = new JSZip();
    const promises = selectedFiles.map(filePath => {
        // Создаем промис для каждой загрузки файла
        return fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Не удалось загрузить файл: ${filePath}`);
                }
                return response.blob();
            })
            .then(blob => {
                // Добавляем файл в ZIP-архив
                const fileName = filePath.split('/').pop();
                zip.file(fileName, blob);
            });
    });

    // Ожидаем завершения всех загрузок, затем создаем и скачиваем ZIP-архив
    Promise.all(promises)
        .then(() => {
            return zip.generateAsync({ type: "blob" });
        })
        .then(content => {
            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'selected_jar_files.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Не удалось создать архив. Проверьте консоль для получения дополнительной информации.');
        });
});
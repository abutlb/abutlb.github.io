// export/JSONExporter.js — حفظ وتحميل مشروع JSON

export class JSONExporter {
    static save(store, filename = 'مخطط-DFD') {
        const data = JSON.stringify(store.serialize(), null, 2);
        const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = (store.project.name || filename) + '.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    static load(store, fileInput, onLoaded) {
        const file = fileInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const data = JSON.parse(ev.target.result);
                store.deserialize(data);
                onLoaded();
            } catch {
                alert('خطأ في قراءة الملف — تأكد من صحة ملف JSON');
            }
        };
        reader.readAsText(file);
        fileInput.value = '';
    }

    static toURL(store) {
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(store.serialize()))));
        return location.origin + location.pathname + '#' + encoded;
    }

    static fromURL(store) {
        const hash = location.hash.slice(1);
        if (!hash) return false;
        try {
            const data = JSON.parse(decodeURIComponent(escape(atob(hash))));
            store.deserialize(data);
            return true;
        } catch {
            return false;
        }
    }
}

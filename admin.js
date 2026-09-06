(() => {
  const dialog = document.querySelector('#admin-dialog');
  const form = document.querySelector('#admin-form');
  const bar = document.querySelector('#admin-bar');
  const message = document.querySelector('#admin-message');
  const editableSelector = 'main h1,main h2,main h3,main p:not(.eyebrow):not(.kicker),main article span,main li span,footer b,footer span,footer small';
  let token = '', repo = '', branch = 'main';
  document.querySelector('#admin-open').addEventListener('click', () => dialog.showModal());
  form.addEventListener('submit', async event => {
    event.preventDefault();
    token = document.querySelector('#admin-token').value.trim();
    repo = document.querySelector('#admin-repo').value.trim();
    branch = document.querySelector('#admin-branch').value.trim();
    message.textContent = '正在验证…';
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}`, {headers: apiHeaders()});
      if (!response.ok) throw new Error('令牌或仓库信息无效');
      const data = await response.json();
      if (!data.permissions?.push) throw new Error('令牌没有 Contents 写入权限');
      dialog.close(); bar.hidden = false;
      document.querySelectorAll(editableSelector).forEach(el => el.contentEditable = 'true');
      message.textContent = '';
    } catch (error) { message.textContent = error.message; }
  });
  document.querySelector('#admin-cancel').addEventListener('click', () => location.reload());
  document.querySelector('#admin-save').addEventListener('click', async event => {
    const button = event.currentTarget; button.disabled = true; button.textContent = '正在保存…';
    try {
      const current = await fetch(`https://api.github.com/repos/${repo}/contents/index.html?ref=${encodeURIComponent(branch)}`, {headers: apiHeaders()});
      if (!current.ok) throw new Error('无法读取当前网页文件');
      const file = await current.json();
      const clone = document.documentElement.cloneNode(true);
      clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
      clone.querySelector('#admin-bar').hidden = true; clone.querySelector('#admin-token').value = '';
      const bytes = new TextEncoder().encode('<!doctype html>\n' + clone.outerHTML);
      let binary = ''; bytes.forEach(byte => binary += String.fromCharCode(byte));
      const saved = await fetch(`https://api.github.com/repos/${repo}/contents/index.html`, {method:'PUT', headers:{...apiHeaders(),'Content-Type':'application/json'}, body:JSON.stringify({message:'Update CV content from admin mode',content:btoa(binary),sha:file.sha,branch})});
      if (!saved.ok) throw new Error('保存失败，请确认令牌仍有效');
      alert('保存成功。GitHub Pages 将在稍后更新。'); location.reload();
    } catch (error) { alert(error.message); button.disabled = false; button.textContent = '保存到 GitHub'; }
  });
  function apiHeaders(){return {Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28'};}
})();

export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await parseFormData(request);
    
    const filename = formData.filename;
    const password = formData.password;
    const content = formData.content;

    if (!filename) {
      return new Response(JSON.stringify({
        success: false,
        error: '缺少文件名'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (!content) {
      return new Response(JSON.stringify({
        success: false,
        error: '文件内容不能为空'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const safeFilename = sanitizeFilename(filename.trim());
    const finalPassword = password || 'default_password';
    
    try {
      // 保存文件内容
      await env.FILES.put('file_' + safeFilename, content);
      // 保存密码
      await env.FILES.put('pwd_' + safeFilename, finalPassword);
      // 保存元数据
      const metadata = {
        ctime: Date.now(),
        size: content.length,
        mtime: Date.now()
      };
      await env.FILES.put('meta_' + safeFilename, JSON.stringify(metadata));

      const domain = request.headers.get('host');
      const link = 'https://' + domain + '/z/' + encodeURIComponent(safeFilename);

      return new Response(JSON.stringify({
        success: true,
        fileLink: link,
        filename: safeFilename
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: '文件保存失败: ' + error.message
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: '解析表单数据失败: ' + error.message
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

async function parseFormData(request) {
  const contentType = request.headers.get('content-type') || '';
  
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await request.text();
    const params = new URLSearchParams(text);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  }
  
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9_\-\u4e00-\u9fa5.]/g, '_');
}

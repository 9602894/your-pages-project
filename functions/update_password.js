export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const formData = await parseFormData(request);
  
  const filename = formData.filename;
  const newPassword = formData.new_password;

  if (!filename || !newPassword) {
    return new Response(JSON.stringify({
      success: false,
      error: '缺少 filename 或 new_password'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const safeFilename = sanitizeFilename(filename.trim());
  
  try {
    // 检查文件是否存在
    const fileExists = await env.FILES.get('file_' + safeFilename);
    if (!fileExists) {
      return new Response(JSON.stringify({
        success: false,
        error: '文件不存在'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 只更新密码，不修改文件内容
    await env.FILES.put('pwd_' + safeFilename, newPassword.trim());

    return new Response(JSON.stringify({
      success: true,
      message: '密码更新成功'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: '密码更新失败: ' + error.message
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

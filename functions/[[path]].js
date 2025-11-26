export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 处理预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'true',
        'Vary': 'Origin'
      }
    });
  }

  try {
    // 主页
    if (pathname === '/' || pathname === '/index.html') {
      return new Response(await getIndexHTML(), {
        headers: { 
          'content-type': 'text/html;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
      });
    }

    // 搜索管理页面
    if (pathname === '/search.html' || pathname === '/search.php') {
      return new Response(await getSearchHTML(request, env), {
        headers: { 
          'content-type': 'text/html;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
      });
    }

    // 其他API路由由各自的函数文件处理
    // 默认返回主页
    return new Response(await getIndexHTML(), {
      headers: { 
        'content-type': 'text/html;charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
    });

  } catch (error) {
    return new Response(`Error: ${error.message}`, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }
}

// 主页HTML (保持不变)
async function getIndexHTML() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <style>   
        ul { padding:15px; width:350px; display:grid; row-gap:10px; grid-template-columns:repeat(3, 1fr); }
        p { font-size: 13px; }
        body {font-family:"Microsoft YaHei"; font-weight: 300; margin: 2px;}
        button { font-size: 14.5px; padding: 0px 1px; background-color: #000; color: #fff; border: none; border-radius: 3px;}               
        textarea {opacity: 0.8; font-size:11px; white-space:pre; overflow:hidden;}
        textarea:hover {overflow: auto;}
        #linkDisplay {
            margin:10px 0;
            padding:8px;
            background:#f0f0f0;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        #linkAnchor {
            color: #0066cc;
            font-weight: bold;
            text-decoration: none;
        }
        #linkAnchor:hover {
            text-decoration: underline;
        }
        .success-message {
            color: green;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .copy-btn {
            margin-left: 10px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 3px;
            padding: 2px 6px;
            cursor: pointer;
        }
    </style>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>📝编辑工具📝</title>
</head>

<body>
    <h2>文件转为<u>链接</u></h2>
    <p>可自定义扩展名，输入完整文件名如：<code>log.json</code>、<code>test.php</code>。〖<a href="./search.html"><b>接口搜索</b></a>〗</p><br>

    <form id="uploadForm">
        <div style="display: flex;">源文：
            <span id="loadingMsg" style="display: none; color: red;">正在读取中...</span>
        </div>
        <textarea name="content" id="content" rows="12" cols="44" required style="width:96%; margin:0;"></textarea>
        <br><br>密码：
        <input type="text" name="password" id="password" required style="width:150px;"> 请牢记！！
        <br>文件名（含扩展名）：
        <input type="text" name="filename" id="filename" required style="width:150px;">
        <button type="button" onclick="readFile()">读取文件</button>
        <button type="button" onclick="uploadFile()">转为链接</button>
    </form>
    <p>可在线编辑已有文件，输入相同文件名与密码。</p><br>    

    <div id="linkDisplay" style="display:none;">
        <div class="success-message">✅ 文件已成功转为链接：</div>
        <a id="linkAnchor" href="" target="_blank"></a>
        <button class="copy-btn" onclick="copyLink()">复制链接</button>
    </div>
    
<ul>
     <li><a href="http://is.is-great.org/">一键接口</a></li>
     <li><a href="http://zozo.work.gd/ys/">接口隐身</a></li>     
      <li><a href="http://94.7749.org/">点播加密</a></li>
      <li><a href="http://94.7749.org/9/">接口解密</a></li>
      <li><a href="http://go2.work.gd/m3u/">接口转换</a></li>

      <li><a href="http://go.work.gd/_JK.htm">大佬接口</a></li>
      <li><a href="http://go2.work.gd/">接口大全</a></li>      
      <li><a href="http://go.7749.org/">一起看看</a></li> 
  </ul>
  
    <script>
        function readFile() {
            const filename = document.getElementById('filename').value;
            const password = document.getElementById('password').value;
            
            if (!filename) {
                alert('请输入文件名');
                return;
            }
            
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '/read0?filename=' + encodeURIComponent(filename) + 
                          '&password=' + encodeURIComponent(password), true);

            document.getElementById('loadingMsg').style.display = 'inline';

            xhr.onload = function() {
                document.getElementById('loadingMsg').style.display = 'none';
                
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        
                        if (response.error) {
                            alert('错误: ' + response.error);
                        } else {
                            document.getElementById('content').value = response.content;
                            showLink(response.fileLink);
                        }
                    } catch (e) {
                        alert('解析响应失败: ' + e.message);
                    }
                } else {
                    alert('请求失败: ' + xhr.statusText);
                }
            };

            xhr.onerror = function() {
                document.getElementById('loadingMsg').style.display = 'none';
                alert('网络错误');
            };

            xhr.send();
        }
        
        function uploadFile() {
            const filename = document.getElementById('filename').value;
            const password = document.getElementById('password').value;
            const content = document.getElementById('content').value;
            
            if (!filename || !password || !content) {
                alert('请填写所有必填字段');
                return;
            }
            
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/upload', true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            
            document.getElementById('loadingMsg').style.display = 'inline';
            document.getElementById('loadingMsg').textContent = '正在生成链接...';
            
            xhr.onload = function() {
                document.getElementById('loadingMsg').style.display = 'none';
                
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (response.success) {
                            showLink(response.fileLink);
                        } else {
                            alert('生成链接失败: ' + (response.error || ''));
                        }
                    } catch (e) {
                        alert('解析响应失败: ' + e.message);
                    }
                } else {
                    alert('上传失败: ' + xhr.statusText);
                }
            };
            
            xhr.onerror = function() {
                document.getElementById('loadingMsg').style.display = 'none';
                alert('网络错误');
            };
            
            // 构建表单数据
            const params = 'filename=' + encodeURIComponent(filename) + 
                          '&password=' + encodeURIComponent(password) + 
                          '&content=' + encodeURIComponent(content);
            xhr.send(params);
        }
        
        function showLink(link) {
            const linkDisplay = document.getElementById('linkDisplay');
            const linkAnchor = document.getElementById('linkAnchor');
            
            linkAnchor.href = link;
            linkAnchor.textContent = link;
            linkDisplay.style.display = 'block';
            
            // 自动滚动到链接显示区域
            linkDisplay.scrollIntoView({ behavior: 'smooth' });
        }
        
        function copyLink() {
            const link = document.getElementById('linkAnchor').href;
            navigator.clipboard.writeText(link)
                .then(() => alert('链接已复制到剪贴板'))
                .catch(err => alert('复制失败: ' + err));
        }
    </script>
</body>
</html>`;
}

// 搜索管理页面HTML (保持不变，但需要调整URL路径)
async function getSearchHTML(request, env) {
  // 这里保持与原始代码相同的getSearchHTML函数内容
  // 但需要将内部URL调整为Pages格式
  // 由于代码很长，这里只展示关键修改部分
  
  const url = new URL(request.url);
  const formData = await parseFormData(request);
  
  // ... 保持原有逻辑 ...
  
  // 在生成的HTML中，调整API端点路径
  const searchHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>文件搜索与管理</title>
<style>
/* 保持原有样式 */
</style>
</head>

<body>
<a href="./" class="back-link">．．． 返回</a>
${messages.map(function(msg) { return '<div class="message">' + msg + '</div>'; }).join('')}

<form method="post" id="searchForm">
<!-- 表单内容保持不变 -->
</form>

${searchResultsHTML}

<script>
// 在JavaScript中更新API端点
function updatePassword(filename, newPassword) {
    // ... 
    xhr.open('POST', '/update_password', true); // 改为Pages路径
    // ...
}

// 其他JavaScript函数保持不变
</script>
</body>
</html>`;

  return searchHTML;
}

// 辅助函数
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
  
  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const result = {};
    for (const [key, value] of formData) {
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

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(2) + 'KB';
  return (bytes / 1048576).toFixed(2) + 'MB';
}

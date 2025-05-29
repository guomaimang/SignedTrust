// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 添加页面加载动画
    animateOnLoad();
    
    // 添加滚动效果
    addScrollEffects();
});

// 导航到服务页面
function navigateToService(url) {
    // 添加点击动画效果
    const clickedCard = event.currentTarget;
    clickedCard.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        // 检查是否为外部链接
        if (url.startsWith('http')) {
            window.open(url, '_blank');
        } else {
            window.location.href = url;
        }
    }, 150);
    
    // 恢复卡片样式
    setTimeout(() => {
        clickedCard.style.transform = '';
    }, 300);
}

// 显示邮件联系信息
function showEmailContact() {
    const message = `请发送邮件至：service@orchanger.com\n\n邮件主题请包含："验签查询"\n\n邮件内容请包含：\n• 文件名称\n• 签发日期\n• 您的联系方式\n\n我们会在1个工作日内回复您。`;
    
    alert(message);
    
    // 可选：同时复制邮箱地址到剪贴板
    copyToClipboard('service@orchanger.com');
}

// 复制到剪贴板
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('邮箱地址已复制到剪贴板');
        }).catch(err => {
            console.error('复制失败:', err);
        });
    } else {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showNotification('邮箱地址已复制到剪贴板');
        } catch (err) {
            console.error('复制失败:', err);
        }
        document.body.removeChild(textArea);
    }
}

// 显示通知
function showNotification(message) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-size: 14px;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 页面加载动画
function animateOnLoad() {
    const heroSection = document.querySelector('.hero-section');
    const serviceCards = document.querySelectorAll('.service-card');
    
    // 英雄区域动画
    if (heroSection) {
        heroSection.style.opacity = '0';
        heroSection.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            heroSection.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            heroSection.style.opacity = '1';
            heroSection.style.transform = 'translateY(0)';
        }, 200);
    }
    
    // 服务卡片延迟动画
    serviceCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 400 + index * 100);
    });
}

// 滚动效果
function addScrollEffects() {
    const cards = document.querySelectorAll('.info-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// 处理服务卡片悬停效果
document.addEventListener('mouseover', function(e) {
    if (e.target.closest('.service-card')) {
        const card = e.target.closest('.service-card');
        card.style.cursor = 'pointer';
    }
});

// 键盘导航支持
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        const focusedCard = document.activeElement.closest('.service-card');
        if (focusedCard) {
            e.preventDefault();
            focusedCard.click();
        }
    }
});

// 添加触摸设备的触觉反馈
document.addEventListener('touchstart', function(e) {
    if (e.target.closest('.service-card')) {
        const card = e.target.closest('.service-card');
        card.style.transform = 'scale(0.98)';
    }
});

document.addEventListener('touchend', function(e) {
    if (e.target.closest('.service-card')) {
        const card = e.target.closest('.service-card');
        setTimeout(() => {
            card.style.transform = '';
        }, 100);
    }
});

// 错误处理
window.addEventListener('error', function(e) {
    console.error('页面错误:', e.error);
});

// 确保在所有浏览器中正常工作
if (!window.NodeList.prototype.forEach) {
    window.NodeList.prototype.forEach = Array.prototype.forEach;
} 
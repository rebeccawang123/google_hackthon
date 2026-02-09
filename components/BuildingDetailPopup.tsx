import React from 'react';
import { X, MapPin, Home, DollarSign, Bed, Bath, Square, Calendar, User } from 'lucide-react';

interface BuildingDetailPopupProps {
  building: any;
  onClose: () => void;
  position?: { x: number; y: number };
}

const BuildingDetailPopup: React.FC<BuildingDetailPopupProps> = ({ 
  building, 
  onClose, 
  position 
}) => {
  if (!building) return null;

  // 计算弹窗位置（避免超出屏幕边界）
  const getPopupPosition = () => {
    if (!position) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    const popupWidth = 320;
    const popupHeight = 400;
    const margin = 20;
    
    let left = position.x;
    let top = position.y;
    
    // 防止超出右边界
    if (position.x + popupWidth + margin > window.innerWidth) {
      left = position.x - popupWidth - 20;
    }
    
    // 防止超出左边界
    if (left < margin) {
      left = margin;
    }
    
    // 防止超出下边界
    if (position.y + popupHeight + margin > window.innerHeight) {
      top = position.y - popupHeight - 20;
    }
    
    // 防止超出上边界
    if (top < margin) {
      top = margin;
    }
    
    return { left, top };
  };

  const popupStyle = getPopupPosition();

  return (
    <div className="fixed inset-0 z-[1000] pointer-events-none">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />
      
      {/* 弹窗主体 */}
      <div 
        className="absolute glass-panel rounded-[2rem] border border-white/10 p-6 w-80 pointer-events-auto shadow-2xl"
        style={popupStyle}
      >
        {/* 关闭按钮 */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X size={16} className="text-white/60" />
        </button>

        {/* 标题区域 */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white mb-1">{building.name || building.label}</h3>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <MapPin size={14} />
            <span>{building.address || 'Chicago, IL'}</span>
          </div>
        </div>

        {/* 房屋图片 */}
        <div className="relative mb-4">
          <div className="w-full h-32 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
            <Home size={48} className="text-white/20" />
          </div>
          {building.price && (
            <div className="absolute top-2 right-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
              <span className="text-green-400 text-sm font-bold">
                ${building.price.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* 详细信息 */}
        <div className="space-y-3 mb-4">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-3">
            {building.bedrooms && (
              <div className="flex items-center gap-2 text-sm">
                <Bed size={16} className="text-blue-400" />
                <span className="text-white/80">{building.bedrooms} Beds</span>
              </div>
            )}
            {building.bathrooms && (
              <div className="flex items-center gap-2 text-sm">
                <Bath size={16} className="text-blue-400" />
                <span className="text-white/80">{building.bathrooms} Baths</span>
              </div>
            )}
          </div>

          {building.squareFootage && (
            <div className="flex items-center gap-2 text-sm">
              <Square size={16} className="text-blue-400" />
              <span className="text-white/80">{building.squareFootage.toLocaleString()} sq ft</span>
            </div>
          )}

          {building.yearBuilt && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-blue-400" />
              <span className="text-white/80">Built {building.yearBuilt}</span>
            </div>
          )}

          {building.type && (
            <div className="flex items-center gap-2 text-sm">
              <Home size={16} className="text-blue-400" />
              <span className="text-white/80 capitalize">{building.type}</span>
            </div>
          )}
        </div>

        {/* 描述 */}
        {building.description && (
          <div className="mb-4">
            <p className="text-sm text-white/70 leading-relaxed">
              {building.description}
            </p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 text-sm transition-all hover:border-white/20"
          >
            取消
          </button>
          <button 
            onClick={() => {
              // 这里可以添加查看详情的逻辑
              console.log('View details for:', building);
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 text-sm font-medium transition-all hover:border-blue-500/50"
          >
            查看详情
          </button>
        </div>

        {/* 装饰性元素 */}
        <div className="absolute -top-1 -right-1 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-1 -left-1 w-16 h-16 bg-gradient-to-tr from-green-500/10 to-blue-500/10 rounded-full blur-2xl" />
      </div>
    </div>
  );
};

export default BuildingDetailPopup;

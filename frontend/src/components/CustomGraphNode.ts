import * as G6 from '@antv/g6';

/**
 * Function to register custom node types
 */
export const registerCustomNodeTypes = () => {
  // Register custom 'router-node' type
  G6.registerNode('router-node', {
    // 继承自 single-node，确保基本交互功能
    options: {
      getAnchorPoints() {
        return [
          [0.5, 0],    // top
          [1, 0.5],    // right
          [0.5, 1],    // bottom
          [0, 0.5],    // left
        ];
      },
    },
    draw(cfg, group) {
      const size = cfg.size || 40;
      const width = size;
      const height = size;

      // Draw background rectangle with light gray fill and transparent border
      const rect = group.addShape('rect', {
        attrs: {
          x: -width / 2,
          y: -height / 2,
          width,
          height,
          fill: '#f0f0f0', // light gray background
          stroke: 'transparent', // transparent border
          lineWidth: 1,
          cursor: 'pointer',
          // Enable event handling on this shape
          capture: true
        },
        name: 'background-rect',
      });

      // Add the router icon image
      const image = group.addShape('image', {
        attrs: {
          x: -width / 2 + 4, // Small padding
          y: -height / 2 + 4, // Small padding
          width: width - 8, // Account for padding
          height: height - 8, // Account for padding
          img: new URL('@/assets/router-icon.png', import.meta.url).href,
          zIndex: 1, // Ensure image is above the background
          cursor: 'pointer'
        },
        name: 'node-image',
        draggable: false
      });

      // 重要：设置图片元素不捕获事件，允许事件穿透到节点容器
      image.set('capture', false);

      // If the node has a label, add it below the icon
      if (cfg.label) {
        const label = group.addShape('text', {
          attrs: {
            text: cfg.label,
            x: 0,
            y: height / 2 + 10, // Position below the icon
            textAlign: 'center',
            textBaseline: 'top',
            fontSize: 12,
            fill: '#333',
            cursor: 'pointer'
          },
          name: 'node-label',
        });
      }

      return rect;
    },

    setState(name, value, item) {
      const group = item.getContainer();
      const rect = group.find(element => element.get('name') === 'background-rect');
      const label = group.find(element => element.get('name') === 'node-label');

      if (name === 'selected') {
        if (value) {
          // Apply selected state styles
          rect.attr({
            stroke: '#2ECC71', // green border when selected
            lineWidth: 4
          });
        } else {
          // Revert to default styles
          rect.attr({
            stroke: 'transparent', // transparent border
            lineWidth: 1
          });
        }
      } else if (name === 'highlight') {
        if (value) {
          // Apply highlight state styles
          rect.attr({
            stroke: '#F39C12', // orange border when highlighted
            lineWidth: 5,
            shadowColor: '#F39C12',
            shadowBlur: 15,
          });
        } else {
          // Revert to default styles
          rect.attr({
            stroke: 'transparent', // transparent border
            lineWidth: 1,
            shadowColor: undefined,
            shadowBlur: 0,
          });
        }
      } else if (name === 'inactive') {
        if (value) {
          // Apply inactive state styles
          rect.attr({
            fill: '#333',
            stroke: '#222',
            opacity: 0.3,
          });
          if (label) {
            label.attr('opacity', 0.3);
          }
        } else {
          // Revert to default styles
          rect.attr({
            fill: '#f0f0f0', // light gray background
            stroke: 'transparent', // transparent border
            opacity: 1,
          });
          if (label) {
            label.attr('opacity', 1);
          }
        }
      }
    },
  }, 'single-node'); // 继承自 single-node 以确保基本交互功能
};
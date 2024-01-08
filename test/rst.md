# 标题1
## 标准
### 1
#### 11
### 2
## 大缩进
### 1
#### 11
### 2

## 标题2
### 三空格缩进
#### 1
#### 2
##### 21

```
- 5空格缩进
     - 1
	 - 2
		  - 21
```
### 空格乱缩进
#### 1
#### 2
\- 21
### 节点内容缩进
#### 1
1's content
1's content2
1's content3
##### 11
#### 2


### 优化：用程序进行转换 #想做
#### 类的初始化
##### 在一个类中保存一个异步结果
###### 类中每一个方法都要用到这个结果
###### 保证类初始化结束时，就得到这个结果
* 工厂静态方法
  * 实例
* 用构造函数来初始化
  * 只能在类中调用同步函数
    * 把获取结果改成同步获取
      * 如何阻塞的的等待异步函数
        * 方案一：忙等待
#### 仅对选中文本的列表项做更改，选中文本的其他内容保持不变
##### 仅对需要更改列表项的做更改
###### 找出所有的列表项及其所属标题层级
* 找到指定位置所属的标题层级
  * 解析整个上下文
  * 从指定位置往上找，找到的第一个标题，就是所属标题层级
    * 找不到就是0级
* 解析大纲层级
  * ob-fv-md解析link
#### 编译为md格式
##### unified
###### html转md
* https://unifiedjs.com/explore/package/remark-stringify/
#### 转换前几层转为标题，后面的层级提高，继续保持为列表
##### 可获取最高的标题
###### 可自动从顶级列表项所属的标题层级中获取
* 从选中的字符串中获取上下文
  * 所属标题层级link
##### 每个列表项都能计算出对应的层级
###### 遍历列表项的，用一个变量记录当前遍历的层级
##### 遍历前几层列表项，在原列表项的位置替换为标题
###### 新建一个列表，新旧列表项一一对应
* 怎么新建列表
  * 用html转换md
* 最后用新列表项替换旧列表项
##### 后几层列表项，在原列表项的位置调整层级
###### 方案之一：
* 新建列表项（link）
###### 方案之一：（采用）
* ast转md
  * 遍历顺序
    * 深度遍历每个列表
      * 判断当前列表是否需要转换
        * 如果需要转换
          * 遍历列表项
            * 列表项顶层操作
            * 深度遍历该列表项中的列表
        * 如果不需要转换
          * 列表项操作
  * 操作ast
    * 直接修改mdast对象
    * 遍历
      * https://unifiedjs.com/learn/recipe/tree-traversal/
    * 创建mdast
      * https://unifiedjs.com/learn/recipe/build-a-syntax-tree/
    * bing AI
  * https://unifiedjs.com/explore/package/remark-stringify/
    * 缩进
      * listItemIndent ('mixed', 'one', or 'tab', default: 'one') — how to indent the content of list items; either with the size of the bullet plus one space (when 'one'), a tab stop ('tab'), or depending on the item and its parent list: 'mixed' uses 'one' if the item and list are tight and 'tab' otherwise
  * 如何设定层级
###### 方案之一：
* 手动编写
###### 根据最高标题以及当前列表项层级来计算调整的目标层级
###### 使用指定的缩进格式
* remark（link）
* 默认使用原有的缩进格式
  * 获取原缩进
    * AST中没有直接存储缩进信息
    * AST中存储了字符串的位置
      * 如第二层几listItem的paragraph开始于第二行第五列
      * 可以根据字符串位置以及所处层级来计算出缩进数量
        * 实例link
          * 缩进数量为（5-1）/2=2
* 可以用户设定
* 也可以从ob设置中获取

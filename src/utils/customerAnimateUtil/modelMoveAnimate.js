
import * as THREE from 'three'
import gsap from 'gsap';


export default class ModelMoveAnimate {

    constructor(_option) {

        this.option = _option
        // console.log(this.option, 'FPSAnimate');


        // 场景
        this.scene = this.option.scene;
        // 相机
        this.camera = this.option.camera;
        // 控制器
        this.orbitControl = this.option.controls;

        // 需要运动的模型
        this.moveModel = this.option.moveModel;


        // 走完需要的时间
        this.useTime = this.option.useTime;
        this.pointsNum = this.option.pointsNum;
        this.cameraFor = this.option.cameraFor || 5;
        this.cameraFOV = this.option.cameraFOV || 0;
        this.cameraLookAtFOV = this.option.cameraLookAtFOV || 5;

        this.modelTurnAround = this.option.modelTurnAround || {
            modelTurnAngle: 0,
            orbitControlTarget: {
                x: 0,
                y: 0,
                z: 0
            },
            cameraPos: {
                x: 0,
                y: 0,
                z: 0
            }
        }
        this.modelTurnAngle = this.modelTurnAround.modelTurnAngle
        this.orbitControlTarget = this.modelTurnAround.orbitControlTarget
        this.cameraPos = this.modelTurnAround.cameraPos


        this.modelTurnAroundStart = this.option.modelTurnAroundStart || {
            modelTurnAngleStart: 0,
            orbitControlTargetStart: {
                x: 0,
                y: 0,
                z: 0
            },
            cameraPosStart: {
                x: 0,
                y: 0,
                z: 0
            }
        }
        this.modelTurnAngleStart = this.modelTurnAroundStart.modelTurnAngleStart
        this.orbitControlTargetStart = this.modelTurnAroundStart.orbitControlTargetStart
        this.cameraPosStart = this.modelTurnAroundStart.cameraPosStart


        this.finalCameraPos = this.option.finalCameraPos || {
            x: 0,
            y: 0,
            z: 0
        }

        this.curvePoint = this.option.curve
        // console.log(this.option.curve.map(v => new THREE.Vector3(v.x, v.y, v.z)));
        this.curveLineWayPoint = this.option.curve.map(v => new THREE.Vector3(v.x, v.y, v.z));

        this.animateFlag = false
        this.endPoint = this.curvePoint[this.curvePoint.length - 1];
        this.curveTension = this.option.tension || 0.1
        this.turnAroundOffset = this.option.turnAroundOffset || 0.5;

        this.turnModelAngle = this.option.turnModelAngle || false;

        this.clock = new THREE.Clock()


    }

    drawMoveWay() {
        // 要画的路线点的位置:this.option.curve
        //

        this.curve = new THREE.CatmullRomCurve3(this.curvePoint, false, 'catmullrom', this.curveTension);
        this.points = this.curve.getPoints(this.pointsNum);


        const geometry = new THREE.BufferGeometry().setFromPoints(this.points);
        const material = new THREE.LineBasicMaterial({
            color: 'black'
        });

        this.curveObj = new THREE.Line(geometry, material);


        this.scene.add(this.curveObj)


    }

    changeLookAtFn(t) {

        // 当前点在线条上的位置
        if (this.moveModel) {
            this.play(t)
        }
    }

    play(t) {
        if (this.moveModel.position.distanceTo(this.endPoint) < 2) { // 当模型运动到终点  动画停止 相机停在模型身上  相机视角在模型lookAt方向
            this.animateFlag = true;
            this.moveModel.position.copy(this.endPoint);

            // const position = this.curve.getPointAt(t)
            // // 返回点t在曲线上位置切线向量
            // const tangent = this.curve.getTangentAt(t);
            // // 位置向量和切线向量相加即为所需朝向的点向量
            // const lookAtVec = tangent.add(new THREE.Vector3(position.x, position.y, position.z));
            // // this.moveModel.lookAt(lookAtVec);

            let pos = this.curve.getPointAt(t - 0.03);
            // 最终相机视角需要停在的位置
            pos.x += this.finalCameraPos.x;
            pos.y += this.finalCameraPos.y;
            pos.z += this.finalCameraPos.z;
            this.camera.position.copy(pos);
            // this.camera.lookAt(position.x, position.y + 5, position.z)
            // this.orbitControl.target.set(position.x, position.y + 5, position.z)



            // 没有传转身相关参数则不执行转身函数 (因为执行默认参数会有问题...)
            if (this.option.modelTurnAround) {
                gsap.to(
                    this.moveModel.rotation, {
                        duration: 2,
                        ease: 'power3.inOut',
                        y: this.modelTurnAngle,
                        onStart: () => {
                            // this.project.camera.controls.enabled = false;
                        },
                        onUpdate: () => {
                            // this.orbitControls.update();

                        },
                        onComplete: () => {
                            // this.project.camera.controls.enabled = true;
                        }
                    }
                )

                gsap.to(
                    this.orbitControl.target, {
                        duration: 2,
                        ease: 'power3.inOut',
                        x: this.orbitControl.target.x + this.orbitControlTarget.x,
                        y: this.orbitControl.target.y + this.orbitControlTarget.y,
                        z: this.orbitControl.target.z + this.orbitControlTarget.z,
                        onStart: () => {
                            // this.project.camera.controls.enabled = false;
                        },
                        onUpdate: () => {
                            // this.orbitControls.update();

                        },
                        onComplete: () => {
                            // this.project.camera.controls.enabled = true;
                        }
                    }
                )

                gsap.to(
                    this.camera.position, {
                        duration: 2,
                        ease: 'power3.inOut',
                        x: this.moveModel.position.x + this.cameraPos.x,
                        y: this.moveModel.position.y + this.cameraPos.y,
                        z: this.moveModel.position.z + this.cameraPos.z,
                        onStart: () => {
                            // this.project.camera.controls.enabled = false;
                        },
                        onUpdate: () => {
                            // this.orbitControls.update();

                        },
                        onComplete: () => {
                        }
                    }
                )
            }


            this.orbitControl.enabled = true;
        } else { // 模型运动过程的位置变化
            const position = this.curve.getPointAt(t);
            // const cameraPosition = this.cameraCurve.getPointAt(t);
            let nPos = new THREE.Vector3(position.x, position.y, position.z);
            // nPos.y -= 4; // 控制模型离地距离
            this.moveModel.position.copy(nPos);
            // 返回点t在曲线上位置切线向量
            const tangent = this.curve.getTangentAt(t);
            // 位置向量和切线向量相加即为所需朝向的点向量
            const lookAtVec = tangent.add(new THREE.Vector3(position.x, position.y, position.z));
            this.moveModel.lookAt(lookAtVec);

            // 遍历曲线上所有的点 实时检测模型移动的方向
            for (let i = 0; i < this.curveLineWayPoint.length; i++) {
                if (this.curveLineWayPoint[i + 1]) {
                    if (
                        this.showNum(this.moveModel.position.x, this.curveLineWayPoint[i].x) &&
                        this.showNum(this.moveModel.position.x, this.curveLineWayPoint[i + 1].x) &&
                        this.curveLineWayPoint[i].x === this.curveLineWayPoint[i + 1].x
                    ) { // 在z轴移动
                        // console.log('z上在动');
                        let pos = this.curve.getPointAt(t);
                        pos.y += this.cameraFOV
                        if (this.curveLineWayPoint[i].z > this.curveLineWayPoint[i + 1].z) {
                            pos.z += this.cameraFor;
                        } else {
                            pos.z -= this.cameraFor;
                        }
                        this.camera.position.copy(pos);
                        this.camera.lookAt(position.x, position.y + this.cameraLookAtFOV, position.z)
                        this.orbitControl.target.set(position.x, position.y + this.cameraLookAtFOV, position.z)
                    } else if (
                        this.showNum(this.moveModel.position.z, this.curveLineWayPoint[i].z) &&
                        this.showNum(this.moveModel.position.z, this.curveLineWayPoint[i + 1].z) &&
                        this.curveLineWayPoint[i].z === this.curveLineWayPoint[i + 1].z
                    ) { // 在x轴移动
                        let pos = this.curve.getPointAt(t);
                        pos.y += this.cameraFOV
                        if (this.curveLineWayPoint[i].x > this.curveLineWayPoint[i + 1].x) {
                            pos.x += this.cameraFor;
                        } else {
                            pos.x -= this.cameraFor;
                        }
                        this.camera.position.copy(pos);
                        this.camera.lookAt(position.x, position.y + this.cameraLookAtFOV, position.z)
                        this.orbitControl.target.set(position.x, position.y + this.cameraLookAtFOV, position.z)
                        // console.log('x上在动');
                    }
                }
            }

        }
    }

    // 判断一个数是否在某个区间内
    showNum(n, qu) {
        let a = `${qu - this.turnAroundOffset}~${qu + this.turnAroundOffset}`;
        let b = a.replace('~', ',');
        let c = b.split(',');
        let d = Number(c[0])
        let m = Number(c[1])
        return (!isNaN(n) && n > d && n < m);
    }

    animate() {
        if (this.curve) {
            let t1 = this.clock.getElapsedTime() * this.useTime; // 计算当前时间进度百分比
            let t2 = this.clock.getElapsedTime() * 0.085; // 计算当前时间进度百分比
            // console.log(time);
            if (!this.animateFlag) {
                // 开始移动关闭控制器
                this.orbitControl.enabled = false;
                this.changeLookAtFn(t1);

            }
        }
    }

    destroyCurve() {
        if (this.curveObj) {
            this.curveObj.geometry && this.curveObj.geometry.dispose();
            if (this.curveObj.material) {
                Object.keys(this.curveObj.material).forEach(prop => {
                    if (this.curveObj.material[prop] && typeof (this.curveObj.material[prop].dispose) === 'function') {
                        this.curveObj.material[prop].dispose()
                    } else {
                        this.curveObj.material.dispose()
                    }
                })
            }
            this.scene.remove(this.curveObj);
        }
    }

}
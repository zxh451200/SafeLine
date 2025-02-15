import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Result from "@site/src/components/detection/Result";
// import { useRouter } from "next/router";
import { useLocation } from "@docusaurus/router";
import { getSampleSet, getSampleSetResult } from "@site/src/api";
import Message from "@site/src/components/Message";
import type {
  RecordSamplesType,
  ResultRowsType,
} from "@site/src/components/detection/types";
import Grid from "@mui/material/Grid";
import SampleList from "@site/src/components/detection/SampleList";
import { Typography } from "@mui/material";
import Layout from "@theme/Layout";
import ThemeProvider from "@site/src/components/Theme";

export default Detection;

function Detection() {
  // const router = useRouter();
  const location = useLocation();
  const [samples, setSamples] = useState<RecordSamplesType>([]);
  const [result, setResult] = useState<ResultRowsType>([]);

  useEffect(() => {
    // useRouter 中获取 参数会有延迟，所以先判断有没有 id 参数
    const realSetId =
      new URLSearchParams(location.search).get("id") || "default";
    // const setId = (router.query.id as string) || "default";
    const setId = "default";
    if (setId !== realSetId) return;

    // 查询样本集合
    getSampleSet(setId).then((res) => {
      if (res.code != 0) {
        Message.error("测试集合 " + setId + ": " + res.msg);
        return;
      }
      if (!res.data.data) {
        Message.error("测试集合 " + setId + ": 获取结果为空");
        return;
      }
      setSamples(
        res.data.data?.map((i: any) => ({
          id: i.id,
          summary: i.summary,
          size: i.length,
          isAttack: i.tag == "black",
        }))
      );
    });

    // 查询样本集合结果
    getSampleSetResult(setId).then(({ data, timeout }) => {
      if (timeout) {
        Message.error("获取检测集结果超时");
        return;
      }
      setResult(
        data.map((i: any) => ({
          engine: i.engine,
          version: i.version,
          detectionRate: percent(i.recall),
          failedRate: percent(i.fdr),
          accuracy: percent(i.accuracy),
          cost: i.elapsed > 0 ? i.elapsed + " 毫秒" : "小于 1 毫秒",
        }))
      );
    });
  }, []);

  const handleSetId = (id: string) => {
    // router.push({
    //   pathname: router.pathname,
    //   query: { id },
    // });
  };

  return (
    <Layout title="效果对比 - 长亭雷池 WAF 社区版">
      <ThemeProvider>
        <Container sx={{ mt: 2, mb: 2 }}>
          {/* <SampleList value={samples} onSetIdChange={handleSetId} /> */}
          {/* <Result rows={result} /> */}

          <img src="/images/sample-screenshot.png" />

          {/* <Grid
            container
            spacing={2}
            sx={{ mt: 3, mb: 3, color: "text.auxiliary" }}
          >
            <Grid item md={3}>
              <Typography>TP: 正确识别到攻击样本的数量</Typography>
              <br />
              <Typography>检出率 = TP / (TP + FN)</Typography>
            </Grid>
            <Grid item md={3}>
              <Typography>TN: 正确识别到普通样本的数量</Typography>
              <br />
              <Typography>误报率 = FP / (TP + FP)</Typography>
            </Grid>
            <Grid item md={3}>
              <Typography>FP: 将普通样本误报为攻击的数量</Typography>
              <br />
              <Typography>准确率 = (TP + TN) / (TP + TN + FP + FN)</Typography>
            </Grid>
            <Grid item md={3}>
              <Typography>FN: 未识别到攻击样本的数量</Typography>
            </Grid>
          </Grid> */}
        </Container>
      </ThemeProvider>
    </Layout>
  );
}

function percent(v: number) {
  return Math.round(v * 10000) / 100 + "%";
}

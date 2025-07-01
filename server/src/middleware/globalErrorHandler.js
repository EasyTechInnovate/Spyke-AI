export default (err, _, res, __) => {
    console.log('[ERROR] ', err)
    res.status(err?.statusCode || 500).json(err)
}
